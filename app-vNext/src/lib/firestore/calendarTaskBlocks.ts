import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type PlanningState = "suggested" | "scheduled" | "accepted";

export type CalendarTaskBlockRecord = {
  id: string;
  taskId: string;
  titleSnapshot: string;
  categoryId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  isFlexible: boolean;
  planningState: PlanningState;
  userAdjusted: boolean;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CalendarTaskBlockDraft = {
  taskId: string;
  titleSnapshot: string;
  categoryId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  isFlexible?: boolean;
  planningState?: PlanningState;
  userAdjusted?: boolean;
};

export function getCalendarTaskBlocksCollection(userId: string) {
  return collection(db, "users", userId, "calendarTaskBlocks");
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

export function normalizeCalendarTaskBlock(
  snapshot: QueryDocumentSnapshot<DocumentData>
) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    taskId: data.taskId || "",
    titleSnapshot: data.titleSnapshot || data.title || "",
    categoryId: data.categoryId || null,
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    isFlexible: data.isFlexible !== false,
    planningState: (data.planningState || "suggested") as PlanningState,
    userAdjusted: Boolean(data.userAdjusted),
    completed: Boolean(data.completed),
    completedAt: toDate(data.completedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies CalendarTaskBlockRecord;
}

export function subscribeToCalendarTaskBlocks(
  userId: string,
  callback: (taskBlocks: CalendarTaskBlockRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getCalendarTaskBlocksCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map(normalizeCalendarTaskBlock));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createCalendarTaskBlock(
  userId: string,
  draft: CalendarTaskBlockDraft
) {
  const documentReference = await addDoc(getCalendarTaskBlocksCollection(userId), {
    taskId: draft.taskId,
    titleSnapshot: draft.titleSnapshot,
    categoryId: draft.categoryId || null,
    startAt: draft.startAt || null,
    endAt: draft.endAt || null,
    isFlexible: draft.isFlexible !== false,
    planningState: draft.planningState || "suggested",
    userAdjusted: Boolean(draft.userAdjusted),
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return documentReference.id;
}

export async function updateCalendarTaskBlock(
  userId: string,
  blockId: string,
  draft: CalendarTaskBlockDraft
) {
  await updateDoc(doc(db, "users", userId, "calendarTaskBlocks", blockId), {
    taskId: draft.taskId,
    titleSnapshot: draft.titleSnapshot,
    categoryId: draft.categoryId || null,
    startAt: draft.startAt || null,
    endAt: draft.endAt || null,
    isFlexible: draft.isFlexible !== false,
    planningState: draft.planningState || "suggested",
    userAdjusted: Boolean(draft.userAdjusted),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCalendarTaskBlock(userId: string, blockId: string) {
  await deleteDoc(doc(db, "users", userId, "calendarTaskBlocks", blockId));
}

export async function markCalendarTaskBlocksComplete(userId: string, blockIds: string[]) {
  if (!blockIds.length) return;

  const batch = writeBatch(db);

  blockIds.forEach((blockId) => {
    batch.update(doc(db, "users", userId, "calendarTaskBlocks", blockId), {
      completed: true,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function markCalendarTaskBlocksActive(userId: string, blockIds: string[]) {
  if (!blockIds.length) return;

  const batch = writeBatch(db);

  blockIds.forEach((blockId) => {
    batch.update(doc(db, "users", userId, "calendarTaskBlocks", blockId), {
      completed: false,
      completedAt: null,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
