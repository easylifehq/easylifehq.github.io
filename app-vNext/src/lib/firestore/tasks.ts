import {
  addDoc,
  arrayRemove,
  arrayUnion,
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

export type PriorityTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TaskItemKind = "task" | "deadline";

export type TaskRecord = {
  id: string;
  itemKind: TaskItemKind;
  title: string;
  notes: string;
  category: string;
  estimatedLength: number | null;
  priorityTier: PriorityTier;
  priorityLabel: string;
  dueDate: Date | null;
  linkedCalendarEventId: string | null;
  linkedNoteId: string | null;
  recurring: boolean;
  completed: boolean;
  completedAt: Date | null;
  linkedCalendarBlockIds: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function getTasksCollection(userId: string) {
  return collection(db, "users", userId, "tasks");
}

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      return new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      );
    }
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeTask(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    itemKind: data.itemKind === "deadline" ? "deadline" : "task",
    title: data.title || "",
    notes: data.notes || "",
    category: data.category || "",
    estimatedLength:
      typeof data.estimatedLength === "number" ? data.estimatedLength : null,
    priorityTier: normalizePriorityTier(data.priorityTier),
    priorityLabel: data.priorityLabel || "",
    dueDate: toDate(data.dueDate),
    linkedCalendarEventId: typeof data.linkedCalendarEventId === "string" ? data.linkedCalendarEventId : null,
    linkedNoteId: typeof data.linkedNoteId === "string" ? data.linkedNoteId : null,
    recurring: Boolean(data.recurring),
    completed: Boolean(data.completed),
    completedAt: toDate(data.completedAt),
    linkedCalendarBlockIds: Array.isArray(data.linkedCalendarBlockIds)
      ? data.linkedCalendarBlockIds.filter((value: unknown): value is string => typeof value === "string")
      : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies TaskRecord;
}

export function subscribeToTasks(
  userId: string,
  callback: (tasks: TaskRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getTasksCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map(normalizeTask));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export type TaskDraft = {
  itemKind?: TaskItemKind;
  title: string;
  notes: string;
  category: string;
  estimatedLength: number | null;
  priorityTier: PriorityTier;
  priorityLabel: string;
  dueDate: string | null;
  linkedCalendarEventId?: string | null;
  linkedNoteId?: string | null;
  recurring?: boolean;
};

export async function createTask(userId: string, draft: TaskDraft) {
  const reference = await addDoc(getTasksCollection(userId), {
    itemKind: draft.itemKind || "task",
    title: draft.title,
    notes: draft.notes,
    category: draft.category,
    estimatedLength: draft.estimatedLength ?? "",
    priorityTier: draft.priorityTier,
    priorityLabel: draft.priorityLabel,
    dueDate: draft.dueDate || null,
    linkedCalendarEventId: draft.linkedCalendarEventId || null,
    linkedNoteId: draft.linkedNoteId || null,
    recurring: Boolean(draft.recurring),
    completed: false,
    completedAt: null,
    linkedCalendarBlockIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

function normalizePriorityTier(value: unknown): PriorityTier {
  const tier = Math.round(Number(value));
  if (tier >= 1 && tier <= 10) {
    return tier as PriorityTier;
  }

  return 5;
}

export async function updateTask(userId: string, taskId: string, draft: TaskDraft) {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    itemKind: draft.itemKind || "task",
    title: draft.title,
    notes: draft.notes,
    category: draft.category,
    estimatedLength: draft.estimatedLength ?? "",
    priorityTier: draft.priorityTier,
    priorityLabel: draft.priorityLabel,
    dueDate: draft.dueDate || null,
    linkedCalendarEventId: draft.linkedCalendarEventId || null,
    linkedNoteId: draft.linkedNoteId || null,
    recurring: Boolean(draft.recurring),
    updatedAt: serverTimestamp(),
  });
}

export async function completeTask(userId: string, taskId: string) {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    completed: true,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reopenTask(userId: string, taskId: string) {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    completed: false,
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function removeTask(userId: string, taskId: string) {
  await deleteDoc(doc(db, "users", userId, "tasks", taskId));
}

export async function addLinkedCalendarBlock(userId: string, taskId: string, blockId: string) {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    linkedCalendarBlockIds: arrayUnion(blockId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeLinkedCalendarBlock(userId: string, taskId: string, blockId: string) {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    linkedCalendarBlockIds: arrayRemove(blockId),
    updatedAt: serverTimestamp(),
  });
}
