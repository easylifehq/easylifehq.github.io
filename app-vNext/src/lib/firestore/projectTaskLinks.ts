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

export type ProjectTaskLinkRecord = {
  id: string;
  projectId: string;
  sectionId: string;
  taskId: string;
  order: number;
  parentLabel: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ProjectTaskLinkDraft = Omit<
  ProjectTaskLinkRecord,
  "id" | "createdAt" | "updatedAt"
>;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeLink(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    projectId: data.projectId || "",
    sectionId: data.sectionId || "",
    taskId: data.taskId || "",
    order: typeof data.order === "number" ? data.order : 0,
    parentLabel: data.parentLabel || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies ProjectTaskLinkRecord;
}

function getProjectTaskLinksCollection(userId: string) {
  return collection(db, "users", userId, "projectTaskLinks");
}

export function subscribeToProjectTaskLinks(
  userId: string,
  callback: (records: ProjectTaskLinkRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getProjectTaskLinksCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeLink)
          .sort((left, right) => left.order - right.order)
      );
    },
    (error) => onError?.(error)
  );
}

export async function createProjectTaskLink(userId: string, draft: ProjectTaskLinkDraft) {
  const reference = await addDoc(getProjectTaskLinksCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateProjectTaskLink(
  userId: string,
  linkId: string,
  draft: ProjectTaskLinkDraft
) {
  await updateDoc(doc(db, "users", userId, "projectTaskLinks", linkId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeProjectTaskLink(userId: string, linkId: string) {
  await deleteDoc(doc(db, "users", userId, "projectTaskLinks", linkId));
}
