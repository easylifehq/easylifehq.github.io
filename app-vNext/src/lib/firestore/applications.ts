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

export type ApplicationStatus =
  | "need_to_apply"
  | "applied"
  | "follow_up"
  | "interviewing"
  | "offer"
  | "archived";

export type ApplicationPriority = "high" | "medium" | "low";
export type OfferResponse = "yes" | "maybe" | "no" | "";

export type ApplicationRecord = {
  id: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  offerResponse: OfferResponse;
  dateApplied: string;
  nextFollowUp: string;
  location: string;
  link: string;
  notes: string;
  contactName: string;
  contactEmail: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ApplicationDraft = Omit<
  ApplicationRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type GeneratedDraftRecord = {
  id: string;
  subject: string;
  body: string;
  company: string;
  applicationId: string;
  emailType: string;
  tone: string;
  createdAt: Date | null;
};

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeApplicationStatus(value: string): ApplicationStatus {
  if (value === "heard_back") return "follow_up";

  const valid: ApplicationStatus[] = [
    "need_to_apply",
    "applied",
    "follow_up",
    "interviewing",
    "offer",
    "archived",
  ];

  return valid.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : "need_to_apply";
}

function normalizePriority(value: string): ApplicationPriority {
  if (value === "high" || value === "low") return value;
  return "medium";
}

function normalizeOfferResponse(value: string): OfferResponse {
  if (value === "yes" || value === "maybe" || value === "no") return value;
  return "";
}

function normalizeApplication(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();
  const status = normalizeApplicationStatus(data.status || "");

  return {
    id: snapshot.id,
    company: data.company || "",
    title: data.title || data.role || "",
    status,
    priority: normalizePriority(data.priority || ""),
    offerResponse: status === "offer" ? normalizeOfferResponse(data.offerResponse || "") : "",
    dateApplied: data.dateApplied || "",
    nextFollowUp: data.nextFollowUp || "",
    location: data.location || "",
    link: data.link || "",
    notes: data.notes || "",
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies ApplicationRecord;
}

function normalizeGeneratedDraft(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    subject: data.subject || "",
    body: data.body || "",
    company: data.company || "",
    applicationId: data.applicationId || "",
    emailType: data.emailType || "",
    tone: data.tone || "",
    createdAt: toDate(data.createdAt),
  } satisfies GeneratedDraftRecord;
}

function getApplicationsCollection(userId: string) {
  return collection(db, "users", userId, "applications");
}

function getDraftsCollection(userId: string) {
  return collection(db, "users", userId, "generatedDrafts");
}

export function subscribeToApplications(
  userId: string,
  callback: (applications: ApplicationRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getApplicationsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeApplication)
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

export function subscribeToGeneratedDrafts(
  userId: string,
  callback: (drafts: GeneratedDraftRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getDraftsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeGeneratedDraft)
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

export async function createApplication(userId: string, draft: ApplicationDraft) {
  await addDoc(getApplicationsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateApplication(userId: string, applicationId: string, draft: ApplicationDraft) {
  await updateDoc(doc(db, "users", userId, "applications", applicationId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeApplication(userId: string, applicationId: string) {
  await deleteDoc(doc(db, "users", userId, "applications", applicationId));
}

export async function saveGeneratedDraft(
  userId: string,
  draft: Omit<GeneratedDraftRecord, "id" | "createdAt">
) {
  await addDoc(getDraftsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
  });
}
