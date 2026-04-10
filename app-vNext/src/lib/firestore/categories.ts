import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type CategoryRecord = {
  name: string;
  color: string;
  type?: string | null;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function getCategoriesCollection(userId: string) {
  return collection(db, "users", userId, "categories");
}
