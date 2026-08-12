import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { duplicateDrinkDraft, normalizeDrinkDraft } from "@/features/easydrinks/domain/drinks";
import { canonicalIngredientName } from "@/features/easydrinks/domain/pantry";
import { drinkDemoFixtures } from "@/features/easydrinks/demo/drinkDemoFixtures";
import { drinkDemoPantry, drinkDemoPreparations } from "@/features/easydrinks/demo/drinkDepthDemoFixtures";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { createDrink, subscribeToDrinks, updateDrink, DRINK_SCHEMA_VERSION, type DrinkDraft, type DrinkRecord } from "@/lib/firestore/drinks";
import { createDrinkPantryItem, deleteDrinkPantryItem, subscribeToDrinkPantry, updateDrinkPantryItem, DRINK_PANTRY_SCHEMA_VERSION, type DrinkPantryDraft, type DrinkPantryItem } from "@/lib/firestore/drinkPantry";
import { createDrinkPreparation, deleteDrinkPreparation, subscribeToDrinkPreparations, DRINK_PREPARATION_SCHEMA_VERSION, type DrinkPreparationDraft, type DrinkPreparationRecord } from "@/lib/firestore/drinkPreparations";
import { createDrinkShoppingHandoff } from "@/lib/firestore/drinkShopping";

type EasyDrinksContextValue = {
  drinks: DrinkRecord[];
  pantry: DrinkPantryItem[];
  preparations: DrinkPreparationRecord[];
  userKey: string;
  isLoading: boolean;
  error: string;
  addDrink: (draft: DrinkDraft) => Promise<string | null>;
  saveDrink: (drinkId: string, draft: DrinkDraft) => Promise<void>;
  copyDrink: (drink: DrinkRecord) => Promise<string | null>;
  addPantryItem: (draft: Omit<DrinkPantryDraft, "canonicalName">) => Promise<string | null>;
  savePantryItem: (itemId: string, draft: Omit<DrinkPantryDraft, "canonicalName">) => Promise<void>;
  removePantryItem: (itemId: string) => Promise<void>;
  logPreparation: (draft: DrinkPreparationDraft) => Promise<string | null>;
  undoPreparation: (preparationId: string) => Promise<void>;
  sendToShopping: (drink: DrinkRecord, ingredients: Array<{ name: string; canonicalName: string; }>) => Promise<string | null>;
};

const EasyDrinksContext = createContext<EasyDrinksContextValue | undefined>(undefined);

export function EasyDrinksProvider({ children }: { children: ReactNode; }) {
  const { user, isDemoMode } = useAuth();
  const [drinks, setDrinks] = useState<DrinkRecord[]>([]);
  const [pantry, setPantry] = useState<DrinkPantryItem[]>([]);
  const [preparations, setPreparations] = useState<DrinkPreparationRecord[]>([]);
  const [loadingSources, setLoadingSources] = useState(0);
  const [error, setError] = useState("");
  const userKey = isDemoMode ? "local-preview" : user?.uid || "signed-out";

  useEffect(() => {
    if (isDemoMode) {
      setDrinks(drinkDemoFixtures);
      setPantry(drinkDemoPantry);
      setPreparations(drinkDemoPreparations);
      setLoadingSources(0);
      setError("");
      return;
    }
    if (!user) {
      setDrinks([]); setPantry([]); setPreparations([]); setLoadingSources(0); setError("");
      return;
    }
    let pending = 3;
    setLoadingSources(pending);
    const settle = () => { pending = Math.max(0, pending - 1); setLoadingSources(pending); };
    const fail = (nextError: Error) => { setError(toSafeFirebaseMessage(nextError)); settle(); };
    const unsubscribers = [
      subscribeToDrinks(user.uid, (records) => { setDrinks(records); setError(""); settle(); }, fail),
      subscribeToDrinkPantry(user.uid, (records) => { setPantry(records); setError(""); settle(); }, fail),
      subscribeToDrinkPreparations(user.uid, (records) => { setPreparations(records); setError(""); settle(); }, fail),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [isDemoMode, user]);

  async function addDrink(draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) {
      const id = `demo-drink-${Date.now()}`;
      const now = new Date();
      setDrinks((current) => [{ id, ownerId: "local-preview", schemaVersion: DRINK_SCHEMA_VERSION, ...normalized, createdAt: now, updatedAt: now }, ...current]);
      return id;
    }
    if (!user) return null;
    return createDrink(user.uid, normalized);
  }

  async function saveDrink(drinkId: string, draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) { setDrinks((current) => current.map((drink) => drink.id === drinkId ? { ...drink, schemaVersion: DRINK_SCHEMA_VERSION, ...normalized, updatedAt: new Date() } : drink)); return; }
    if (user) await updateDrink(user.uid, drinkId, normalized);
  }

  async function addPantryItem(draft: Omit<DrinkPantryDraft, "canonicalName">) {
    const normalized = { ...draft, name: draft.name.trim().slice(0, 200), canonicalName: canonicalIngredientName(draft.name), note: draft.note.trim().slice(0, 500) };
    if (!normalized.canonicalName) throw new Error("Pantry ingredient name is required.");
    if (pantry.some((item) => item.canonicalName === normalized.canonicalName)) throw new Error("That pantry ingredient is already listed. Update its status instead.");
    if (isDemoMode) { const id = "demo-pantry-" + Date.now(); const now = new Date(); const record: DrinkPantryItem = { id, ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, ...normalized, createdAt: now, updatedAt: now }; setPantry((current) => [...current, record].sort((a, b) => a.name.localeCompare(b.name))); return id; }
    if (!user) return null;
    return createDrinkPantryItem(user.uid, normalized);
  }

  async function savePantryItem(itemId: string, draft: Omit<DrinkPantryDraft, "canonicalName">) {
    const normalized = { ...draft, name: draft.name.trim().slice(0, 200), canonicalName: canonicalIngredientName(draft.name), note: draft.note.trim().slice(0, 500) };
    if (isDemoMode) { setPantry((current) => current.map((item) => item.id === itemId ? { ...item, ...normalized, updatedAt: new Date() } : item)); return; }
    if (user) await updateDrinkPantryItem(user.uid, itemId, normalized);
  }

  async function removePantryItem(itemId: string) {
    if (isDemoMode) { setPantry((current) => current.filter((item) => item.id !== itemId)); return; }
    if (user) await deleteDrinkPantryItem(user.uid, itemId);
  }

  async function logPreparation(draft: DrinkPreparationDraft) {
    if (isDemoMode) { const id = `demo-prep-${Date.now()}`; const now = new Date(); setPreparations((current) => [{ id, ownerId: "local-preview", schemaVersion: DRINK_PREPARATION_SCHEMA_VERSION, ...draft, preparedAt: now, createdAt: now }, ...current]); return id; }
    if (!user) return null;
    return createDrinkPreparation(user.uid, draft);
  }

  async function undoPreparation(preparationId: string) {
    if (isDemoMode) { setPreparations((current) => current.filter((record) => record.id !== preparationId)); return; }
    if (user) await deleteDrinkPreparation(user.uid, preparationId);
  }

  async function sendToShopping(drink: DrinkRecord, ingredients: Array<{ name: string; canonicalName: string; }>) {
    if (isDemoMode) return `demo-shopping-${drink.id}`;
    if (!user) return null;
    return createDrinkShoppingHandoff(user.uid, { drinkId: drink.id, drinkName: drink.name, ingredients });
  }

  const value = useMemo(() => ({ drinks, pantry, preparations, userKey, isLoading: loadingSources > 0, error, addDrink, saveDrink, copyDrink: (drink: DrinkRecord) => addDrink(duplicateDrinkDraft(drink)), addPantryItem, savePantryItem, removePantryItem, logPreparation, undoPreparation, sendToShopping }), [drinks, pantry, preparations, userKey, loadingSources, error, isDemoMode, user]);
  return <EasyDrinksContext.Provider value={value}>{children}</EasyDrinksContext.Provider>;
}

export function useEasyDrinks() { const context = useContext(EasyDrinksContext); if (!context) throw new Error("useEasyDrinks must be used inside EasyDrinksProvider"); return context; }
