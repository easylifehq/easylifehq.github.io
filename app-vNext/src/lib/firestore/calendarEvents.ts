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

export type CalendarEventType =
  | "class"
  | "work"
  | "appointment"
  | "personal"
  | "other";

export type CalendarEventRecord = {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  allDay: boolean;
  isRecurring: boolean;
  recurrenceRule: string | null;
  eventType: CalendarEventType;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CalendarEventDraft = {
  title: string;
  description: string;
  categoryId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  eventType?: CalendarEventType;
};

export function getCalendarEventsCollection(userId: string) {
  return collection(db, "users", userId, "calendarEvents");
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

export function normalizeCalendarEvent(
  snapshot: QueryDocumentSnapshot<DocumentData>
) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title || "",
    description: data.description || "",
    categoryId: data.categoryId || null,
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    allDay: Boolean(data.allDay),
    isRecurring: Boolean(data.isRecurring),
    recurrenceRule: data.recurrenceRule || null,
    eventType: (data.eventType || "other") as CalendarEventType,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies CalendarEventRecord;
}

export function subscribeToCalendarEvents(
  userId: string,
  callback: (events: CalendarEventRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getCalendarEventsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map(normalizeCalendarEvent));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createCalendarEvent(
  userId: string,
  draft: CalendarEventDraft
) {
  const reference = await addDoc(getCalendarEventsCollection(userId), {
    title: draft.title,
    description: draft.description,
    categoryId: draft.categoryId || null,
    startAt: draft.startAt || null,
    endAt: draft.endAt || null,
    allDay: Boolean(draft.allDay),
    isRecurring: Boolean(draft.isRecurring),
    recurrenceRule: draft.recurrenceRule || null,
    eventType: draft.eventType || "other",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  draft: CalendarEventDraft
) {
  await updateDoc(doc(db, "users", userId, "calendarEvents", eventId), {
    title: draft.title,
    description: draft.description,
    categoryId: draft.categoryId || null,
    startAt: draft.startAt || null,
    endAt: draft.endAt || null,
    allDay: Boolean(draft.allDay),
    isRecurring: Boolean(draft.isRecurring),
    recurrenceRule: draft.recurrenceRule || null,
    eventType: draft.eventType || "other",
    updatedAt: serverTimestamp(),
  });
}

export async function removeCalendarEvent(userId: string, eventId: string) {
  await deleteDoc(doc(db, "users", userId, "calendarEvents", eventId));
}
