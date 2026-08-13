import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const DRINK_SCHEMA_VERSION = "easydrinks-v2";
export const LEGACY_DRINK_SCHEMA_VERSION = "easydrinks-v1";

export const drinkTypes = [
  "cocktail",
  "mocktail",
  "coffee",
  "tea",
  "smoothie",
  "protein-shake",
  "other",
] as const;

export type DrinkType = (typeof drinkTypes)[number];

export type DrinkIngredient = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  optional: boolean;
};

export type DrinkPreparationStep = {
  id: string;
  text: string;
  durationSeconds: number | null;
};

export type DrinkRecord = {
  id: string;
  ownerId: string;
  schemaVersion: typeof DRINK_SCHEMA_VERSION | typeof LEGACY_DRINK_SCHEMA_VERSION;
  name: string;
  type: DrinkType;
  baseServings: number;
  ingredients: DrinkIngredient[];
  steps: DrinkPreparationStep[];
  instructions: string;
  notes: string;
  rating: number;
  tags: string[];
  date: string;
  favorite: boolean;
  sourceDrinkId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type DrinkDraft = Omit<DrinkRecord, "id" | "ownerId" | "schemaVersion" | "createdAt" | "updatedAt">;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date; }).toDate === "function") {
    return (value as { toDate: () => Date; }).toDate();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function text(value: unknown, maximum = 20_000) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

function safeRecordId(value: unknown, fallback: string) {
  const candidate = text(value, 120);
  return /^[A-Za-z0-9_-]{1,120}$/.test(candidate) ? candidate : fallback;
}

function normalizeDrink(snapshot: QueryDocumentSnapshot<DocumentData>): DrinkRecord {
  const data = snapshot.data();
  const type = drinkTypes.includes(data.type as DrinkType) ? (data.type as DrinkType) : "other";
  const ingredients = Array.isArray(data.ingredients)
    ? data.ingredients.slice(0, 40).map((ingredient: unknown, index: number) => {
      const item = ingredient && typeof ingredient === "object" ? (ingredient as Record<string, unknown>) : {};
      return {
        id: safeRecordId(item.id, `legacy-ingredient-${index + 1}`),
        name: text(item.name, 200),
        amount: text(item.amount, 80),
        unit: text(item.unit, 80),
        optional: Boolean(item.optional),
      };
    })
    : [];
  const legacyInstructions = text(data.instructions);
  const steps = Array.isArray(data.steps)
    ? data.steps.slice(0, 40).map((step: unknown, index: number) => {
      const item = step && typeof step === "object" ? (step as Record<string, unknown>) : {};
      const duration = Number(item.durationSeconds);
      return {
        id: safeRecordId(item.id, `legacy-step-${index + 1}`),
        text: text(item.text, 2_000),
        durationSeconds: Number.isInteger(duration) && duration >= 1 && duration <= 86_400 ? duration : null,
      };
    }).filter((step) => step.text)
    : legacyInstructions
      ? [{ id: "legacy-step-1", text: legacyInstructions, durationSeconds: null }]
      : [];
  const baseServings = Number(data.baseServings);

  return {
    id: snapshot.id,
    ownerId: text(data.ownerId, 200),
    schemaVersion: data.schemaVersion === LEGACY_DRINK_SCHEMA_VERSION ? LEGACY_DRINK_SCHEMA_VERSION : DRINK_SCHEMA_VERSION,
    name: text(data.name, 300),
    type,
    baseServings: Number.isInteger(baseServings) && baseServings >= 1 && baseServings <= 100 ? baseServings : 1,
    ingredients,
    steps,
    instructions: legacyInstructions || steps.map((step) => step.text).join("\n"),
    notes: text(data.notes),
    rating: Number.isInteger(data.rating) && data.rating >= 0 && data.rating <= 5 ? data.rating : 0,
    tags: Array.isArray(data.tags) ? data.tags.filter((tag: unknown): tag is string => typeof tag === "string").slice(0, 24) : [],
    date: /^\d{4}-\d{2}-\d{2}$/.test(data.date || "") ? data.date : "",
    favorite: Boolean(data.favorite),
    sourceDrinkId: typeof data.sourceDrinkId === "string" && data.sourceDrinkId ? data.sourceDrinkId : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function getDrinksCollection(userId: string) {
  return collection(db, "users", userId, "drinks");
}

export function subscribeToDrinks(
  userId: string,
  callback: (drinks: DrinkRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getDrinksCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeDrink)
          .sort((left, right) => right.date.localeCompare(left.date) || left.name.localeCompare(right.name))
      );
    },
    (error) => onError?.(error)
  );
}

function drinkWriteData(draft: DrinkDraft) {
  return {
    ...draft,
    instructions: draft.steps.map((step) => step.text).join("\n"),
  };
}

export async function createDrink(userId: string, draft: DrinkDraft) {
  const reference = await addDoc(getDrinksCollection(userId), {
    ...drinkWriteData(draft),
    ownerId: userId,
    schemaVersion: DRINK_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateDrink(userId: string, drinkId: string, draft: DrinkDraft) {
  await updateDoc(doc(db, "users", userId, "drinks", drinkId), {
    ...drinkWriteData(draft),
    ownerId: userId,
    schemaVersion: DRINK_SCHEMA_VERSION,
    updatedAt: serverTimestamp(),
  });
}
