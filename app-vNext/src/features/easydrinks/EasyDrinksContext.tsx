import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { duplicateDrinkDraft, normalizeDrinkDraft } from "@/features/easydrinks/domain/drinks";
import { canonicalIngredientName } from "@/features/easydrinks/domain/pantry";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { createDrink, subscribeToDrinks, updateDrink, type DrinkDraft, type DrinkRecord } from "@/lib/firestore/drinks";
import { createDrinkPantryItem, deleteDrinkPantryItem, subscribeToDrinkPantry, updateDrinkPantryItem, type DrinkPantryDraft, type DrinkPantryItem } from "@/lib/firestore/drinkPantry";
import { createDrinkPreparation, deleteDrinkPreparation, subscribeToDrinkPreparations, type DrinkPreparationDraft, type DrinkPreparationRecord } from "@/lib/firestore/drinkPreparations";
import { createDrinkShoppingHandoff } from "@/lib/firestore/drinkShopping";
import {
  createSyntheticDrink,
  createSyntheticPantryItem,
  createSyntheticPreparation,
  removeSyntheticPantryItem,
  removeSyntheticPreparation,
  updateSyntheticDrink,
  updateSyntheticPantryItem,
  useSyntheticAuditState,
} from "@/lib/runtime/syntheticAuditState";

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
  const syntheticState = useSyntheticAuditState(isDemoMode);
  const [drinks, setDrinks] = useState<DrinkRecord[]>([]);
  const [pantry, setPantry] = useState<DrinkPantryItem[]>([]);
  const [preparations, setPreparations] = useState<DrinkPreparationRecord[]>([]);
  const [loadingSources, setLoadingSources] = useState(0);
  const [error, setError] = useState("");
  const userKey = isDemoMode ? "local-preview" : user?.uid || "signed-out";

  useEffect(() => {
    if (isDemoMode) {
      setDrinks(syntheticState.drinks);
      setPantry(syntheticState.pantry);
      setPreparations(syntheticState.preparations);
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
  }, [isDemoMode, syntheticState.drinks, syntheticState.pantry, syntheticState.preparations, user]);

  async function addDrink(draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) {
      return createSyntheticDrink(normalized);
    }
    if (!user) return null;
    return createDrink(user.uid, normalized);
  }

  async function saveDrink(drinkId: string, draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) return updateSyntheticDrink(drinkId, normalized);
    if (user) await updateDrink(user.uid, drinkId, normalized);
  }

  async function addPantryItem(draft: Omit<DrinkPantryDraft, "canonicalName">) {
    const normalized = { ...draft, name: draft.name.trim().slice(0, 200), canonicalName: canonicalIngredientName(draft.name), note: draft.note.trim().slice(0, 500) };
    if (!normalized.canonicalName) throw new Error("Pantry ingredient name is required.");
    if (pantry.some((item) => item.canonicalName === normalized.canonicalName)) throw new Error("That pantry ingredient is already listed. Update its status instead.");
    if (isDemoMode) return createSyntheticPantryItem(normalized);
    if (!user) return null;
    return createDrinkPantryItem(user.uid, normalized);
  }

  async function savePantryItem(itemId: string, draft: Omit<DrinkPantryDraft, "canonicalName">) {
    const normalized = { ...draft, name: draft.name.trim().slice(0, 200), canonicalName: canonicalIngredientName(draft.name), note: draft.note.trim().slice(0, 500) };
    if (isDemoMode) return updateSyntheticPantryItem(itemId, normalized);
    if (user) await updateDrinkPantryItem(user.uid, itemId, normalized);
  }

  async function removePantryItem(itemId: string) {
    if (isDemoMode) return removeSyntheticPantryItem(itemId);
    if (user) await deleteDrinkPantryItem(user.uid, itemId);
  }

  async function logPreparation(draft: DrinkPreparationDraft) {
    if (isDemoMode) return createSyntheticPreparation(draft);
    if (!user) return null;
    return createDrinkPreparation(user.uid, draft);
  }

  async function undoPreparation(preparationId: string) {
    if (isDemoMode) return removeSyntheticPreparation(preparationId);
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
