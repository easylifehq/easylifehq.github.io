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

export type ContactRecord = {
  id: string;
  fullName: string;
  relationship: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  source: string;
  status: "active" | "warm" | "cold";
  relatedOpportunityIds: string[];
  lastContactedAt: string;
  nextFollowUpAt: string;
  notes: string;
  archived: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ContactDraft = Omit<ContactRecord, "id" | "createdAt" | "updatedAt">;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeContact(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();
  const status = data.status === "active" || data.status === "warm" ? data.status : "cold";

  return {
    id: snapshot.id,
    fullName: data.fullName || "",
    relationship: data.relationship || "",
    company: data.company || "",
    role: data.role || "",
    email: data.email || "",
    phone: data.phone || "",
    linkedinUrl: data.linkedinUrl || "",
    source: data.source || "",
    status,
    relatedOpportunityIds: Array.isArray(data.relatedOpportunityIds)
      ? data.relatedOpportunityIds.filter((value: unknown): value is string => typeof value === "string")
      : [],
    lastContactedAt: data.lastContactedAt || "",
    nextFollowUpAt: data.nextFollowUpAt || "",
    notes: data.notes || "",
    archived: Boolean(data.archived),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies ContactRecord;
}

function getContactsCollection(userId: string) {
  return collection(db, "users", userId, "contacts");
}

export function subscribeToContacts(
  userId: string,
  callback: (contacts: ContactRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getContactsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeContact)
          .sort(
            (left, right) =>
              (right.createdAt?.getTime() || 0) - (left.createdAt?.getTime() || 0)
          )
      );
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createContact(userId: string, draft: ContactDraft) {
  const reference = await addDoc(getContactsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateContact(userId: string, contactId: string, draft: ContactDraft) {
  await updateDoc(doc(db, "users", userId, "contacts", contactId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveContact(userId: string, contactId: string) {
  await updateDoc(doc(db, "users", userId, "contacts", contactId), {
    archived: true,
    updatedAt: serverTimestamp(),
  });
}
