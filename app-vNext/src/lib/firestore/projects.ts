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

export type ProjectStatus = "active" | "paused" | "completed";

export type ProjectRecord = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: ProjectStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ProjectDraft = Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeProject(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title || "",
    description: data.description || "",
    targetDate: data.targetDate || "",
    status: (data.status || "active") as ProjectStatus,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies ProjectRecord;
}

function getProjectsCollection(userId: string) {
  return collection(db, "users", userId, "projects");
}

export function subscribeToProjects(
  userId: string,
  callback: (records: ProjectRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getProjectsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeProject)
          .sort((left, right) => (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0))
      );
    },
    (error) => onError?.(error)
  );
}

export async function createProject(userId: string, draft: ProjectDraft) {
  const reference = await addDoc(getProjectsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateProject(userId: string, projectId: string, draft: ProjectDraft) {
  await updateDoc(doc(db, "users", userId, "projects", projectId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeProject(userId: string, projectId: string) {
  await deleteDoc(doc(db, "users", userId, "projects", projectId));
}
