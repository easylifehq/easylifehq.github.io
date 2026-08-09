import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { duplicateDrinkDraft, normalizeDrinkDraft } from "@/features/easydrinks/domain/drinks";
import { drinkDemoFixtures } from "@/features/easydrinks/demo/drinkDemoFixtures";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { createDrink, subscribeToDrinks, updateDrink, type DrinkDraft, type DrinkRecord } from "@/lib/firestore/drinks";

type EasyDrinksContextValue = {
  drinks: DrinkRecord[];
  isLoading: boolean;
  error: string;
  addDrink: (draft: DrinkDraft) => Promise<string | null>;
  saveDrink: (drinkId: string, draft: DrinkDraft) => Promise<void>;
  copyDrink: (drink: DrinkRecord) => Promise<string | null>;
};

const EasyDrinksContext = createContext<EasyDrinksContextValue | undefined>(undefined);

export function EasyDrinksProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [drinks, setDrinks] = useState<DrinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isDemoMode) {
      setDrinks(drinkDemoFixtures);
      setIsLoading(false);
      setError("");
      return;
    }
    if (!user) {
      setDrinks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    return subscribeToDrinks(user.uid, (records) => {
      setDrinks(records);
      setIsLoading(false);
      setError("");
    }, (nextError) => {
      setError(toSafeFirebaseMessage(nextError));
      setIsLoading(false);
    });
  }, [isDemoMode, user]);

  async function addDrink(draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) {
      const id = `demo-drink-${Date.now()}`;
      const now = new Date();
      setDrinks((current) => [{ id, ownerId: "local-preview", schemaVersion: "easydrinks-v1", ...normalized, createdAt: now, updatedAt: now }, ...current]);
      return id;
    }
    if (!user) return null;
    return createDrink(user.uid, normalized);
  }

  async function saveDrink(drinkId: string, draft: DrinkDraft) {
    const normalized = normalizeDrinkDraft(draft);
    if (!normalized.name) throw new Error("Drink name is required.");
    if (isDemoMode) {
      setDrinks((current) => current.map((drink) => drink.id === drinkId ? { ...drink, ...normalized, updatedAt: new Date() } : drink));
      return;
    }
    if (!user) return;
    await updateDrink(user.uid, drinkId, normalized);
  }

  async function copyDrink(drink: DrinkRecord) {
    return addDrink(duplicateDrinkDraft(drink));
  }

  const value = useMemo(() => ({ drinks, isLoading, error, addDrink, saveDrink, copyDrink }), [drinks, error, isDemoMode, isLoading, user]);
  return <EasyDrinksContext.Provider value={value}>{children}</EasyDrinksContext.Provider>;
}

export function useEasyDrinks() {
  const context = useContext(EasyDrinksContext);
  if (!context) throw new Error("useEasyDrinks must be used inside EasyDrinksProvider");
  return context;
}
