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

export type ProjectSectionRecord = {
  id: string;
  projectId: string;
  title: string;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ProjectSectionDraft = Omit<ProjectSectionRecord, "id" | "createdAt" | "updatedAt">;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeSection(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    projectId: data.projectId || "",
    title: data.title || "",
    order: typeof data.order === "number" ? data.order : 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies ProjectSectionRecord;
}

function getProjectSectionsCollection(userId: string) {
  return collection(db, "users", userId, "projectSections");
}

export function subscribeToProjectSections(
  userId: string,
  callback: (records: ProjectSectionRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getProjectSectionsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeSection)
          .sort((left, right) => left.order - right.order)
      );
    },
    (error) => onError?.(error)
  );
}

export async function createProjectSection(userId: string, draft: ProjectSectionDraft) {
  const reference = await addDoc(getProjectSectionsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateProjectSection(
  userId: string,
  sectionId: string,
  draft: ProjectSectionDraft
) {
  await updateDoc(doc(db, "users", userId, "projectSections", sectionId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeProjectSection(userId: string, sectionId: string) {
  await deleteDoc(doc(db, "users", userId, "projectSections", sectionId));
}
