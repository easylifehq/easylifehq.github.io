import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type CalendarTaskBlockRecord = {
  taskId: string;
  titleSnapshot: string;
  categoryId: string | null;
  startAt: Date;
  endAt: Date;
  isFlexible: true;
  planningState: "suggested" | "scheduled" | "accepted";
  userAdjusted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function getCalendarTaskBlocksCollection(userId: string) {
  return collection(db, "users", userId, "calendarTaskBlocks");
}
