import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc, type DocumentData, type QueryDocumentSnapshot, type QuerySnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const DRINK_PANTRY_SCHEMA_VERSION = "easydrinks-pantry-v1";
export type DrinkPantryStatus = "available" | "unavailable";
export type DrinkPantryItem = { id: string; ownerId: string; schemaVersion: typeof DRINK_PANTRY_SCHEMA_VERSION; name: string; canonicalName: string; status: DrinkPantryStatus; note: string; createdAt: Date | null; updatedAt: Date | null; };
export type DrinkPantryDraft = Pick<DrinkPantryItem, "name" | "canonicalName" | "status" | "note">;

function toDate(value: unknown) { if (!value) return null; if (value instanceof Date) return value; if (typeof (value as { toDate?: () => Date; }).toDate === "function") return (value as { toDate: () => Date; }).toDate(); const parsed = new Date(String(value)); return Number.isNaN(parsed.getTime()) ? null : parsed; }
function normalize(snapshot: QueryDocumentSnapshot<DocumentData>): DrinkPantryItem { const data = snapshot.data(); return { id: snapshot.id, ownerId: typeof data.ownerId === "string" ? data.ownerId : "", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, name: typeof data.name === "string" ? data.name.slice(0, 200) : "", canonicalName: typeof data.canonicalName === "string" ? data.canonicalName.slice(0, 200) : "", status: data.status === "unavailable" ? "unavailable" : "available", note: typeof data.note === "string" ? data.note.slice(0, 500) : "", createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) }; }
function pantryCollection(userId: string) { return collection(db, "users", userId, "drinkPantry"); }
export function subscribeToDrinkPantry(userId: string, callback: (items: DrinkPantryItem[]) => void, onError?: (error: Error) => void) { return onSnapshot(pantryCollection(userId), (snapshot: QuerySnapshot<DocumentData>) => callback(snapshot.docs.map(normalize).sort((a, b) => a.name.localeCompare(b.name))), (error) => onError?.(error)); }
export async function createDrinkPantryItem(userId: string, draft: DrinkPantryDraft) { return (await addDoc(pantryCollection(userId), { ...draft, ownerId: userId, schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })).id; }
export async function updateDrinkPantryItem(userId: string, itemId: string, draft: DrinkPantryDraft) { await updateDoc(doc(db, "users", userId, "drinkPantry", itemId), { ...draft, ownerId: userId, schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, updatedAt: serverTimestamp() }); }

export async function deleteDrinkPantryItem(userId: string, itemId: string) { await deleteDoc(doc(db, "users", userId, "drinkPantry", itemId)); }
