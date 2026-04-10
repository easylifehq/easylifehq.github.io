import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type CalendarEventRecord = {
  title: string;
  description: string;
  categoryId: string | null;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  isRecurring: boolean;
  recurrenceRule: string | null;
  eventType: "class" | "work" | "appointment" | "personal" | "other";
  createdAt: Date;
  updatedAt: Date;
};

export function getCalendarEventsCollection(userId: string) {
  return collection(db, "users", userId, "calendarEvents");
}
