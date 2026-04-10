import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type CategoryRecord = {
  id: string;
  name: string;
  color: string;
  type?: string | null;
  isDefault?: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CategoryDraft = {
  name: string;
  color: string;
  type?: string | null;
  isDefault?: boolean;
};

export const DEFAULT_CATEGORIES: CategoryRecord[] = [
  {
    id: "default-school",
    name: "School",
    color: "#4d7fe6",
    type: "school",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "default-work",
    name: "Work",
    color: "#2f9a73",
    type: "work",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "default-gym",
    name: "Gym",
    color: "#d88238",
    type: "gym",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "default-personal",
    name: "Personal",
    color: "#bd6c9b",
    type: "personal",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "default-social",
    name: "Social",
    color: "#8f73dd",
    type: "social",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "default-todo",
    name: "To-Do",
    color: "#7a8a9d",
    type: "todo",
    isDefault: true,
    createdAt: null,
    updatedAt: null,
  },
];

export function getCategoriesCollection(userId: string) {
  return collection(db, "users", userId, "categories");
}

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeCategory(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name || "",
    color: data.color || "#7a8a9d",
    type: data.type || null,
    isDefault: Boolean(data.isDefault),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies CategoryRecord;
}

function mergeWithDefaultCategories(categories: CategoryRecord[]) {
  if (categories.length === 0) {
    return DEFAULT_CATEGORIES;
  }

  const categoryKeys = new Set(
    categories.flatMap((category) => [
      category.id.trim().toLowerCase(),
      category.name.trim().toLowerCase(),
      category.type?.trim().toLowerCase() || "",
    ])
  );

  const fallbacks = DEFAULT_CATEGORIES.filter((category) => {
    const idKey = category.id.trim().toLowerCase();
    const nameKey = category.name.trim().toLowerCase();
    const typeKey = category.type?.trim().toLowerCase() || "";

    return (
      !categoryKeys.has(idKey) &&
      !categoryKeys.has(nameKey) &&
      !categoryKeys.has(typeKey)
    );
  });

  return [...categories, ...fallbacks];
}

export function subscribeToCategories(
  userId: string,
  callback: (categories: CategoryRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getCategoriesCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(mergeWithDefaultCategories(snapshot.docs.map(normalizeCategory)));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createCategory(userId: string, draft: CategoryDraft) {
  await addDoc(getCategoriesCollection(userId), {
    name: draft.name,
    color: draft.color,
    type: draft.type || null,
    isDefault: Boolean(draft.isDefault),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  draft: CategoryDraft
) {
  await updateDoc(doc(db, "users", userId, "categories", categoryId), {
    name: draft.name,
    color: draft.color,
    type: draft.type || null,
    isDefault: Boolean(draft.isDefault),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCategory(userId: string, categoryId: string) {
  await deleteDoc(doc(db, "users", userId, "categories", categoryId));
}
