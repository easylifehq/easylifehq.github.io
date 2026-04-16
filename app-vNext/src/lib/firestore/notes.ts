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

export type NoteRecord = {
  id: string;
  title: string;
  tags: string[];
  folderId: string;
  pinned: boolean;
  bodyHtml: string;
  bodyText: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

export type NoteDraft = {
  title: string;
  tags: string[];
  folderId: string;
  pinned: boolean;
  bodyText: string;
};

export type NoteFolderRecord = {
  id: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textToHtml(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) return "<p><br /></p>";
      if (trimmed.startsWith("## ")) return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${escapeHtml(trimmed.slice(2))}</h1>`;
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join("");
}

function normalizeNote(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title || "",
    tags: Array.isArray(data.tags)
      ? data.tags.filter((value: unknown): value is string => typeof value === "string")
      : [],
    folderId: typeof data.folderId === "string" ? data.folderId : "",
    pinned: Boolean(data.pinned),
    bodyHtml: data.bodyHtml || "",
    bodyText: data.bodyText || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    deletedAt: toDate(data.deletedAt),
  } satisfies NoteRecord;
}

function normalizeFolder(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies NoteFolderRecord;
}

function getNotesCollection(userId: string) {
  return collection(db, "users", userId, "notes");
}

function getNoteFoldersCollection(userId: string) {
  return collection(db, "users", userId, "noteFolders");
}

export function subscribeToNotes(
  userId: string,
  callback: (notes: NoteRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getNotesCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map(normalizeNote));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToNoteFolders(
  userId: string,
  callback: (folders: NoteFolderRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getNoteFoldersCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map(normalizeFolder));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createNoteFolder(userId: string, name: string) {
  const folderRef = await addDoc(getNoteFoldersCollection(userId), {
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return folderRef.id;
}

export async function createNote(userId: string) {
  const noteRef = await addDoc(getNotesCollection(userId), {
    title: "",
    tags: [],
    folderId: "",
    pinned: false,
    bodyHtml: "",
    bodyText: "",
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return noteRef.id;
}

export async function updateNote(userId: string, noteId: string, draft: NoteDraft) {
  await updateDoc(doc(db, "users", userId, "notes", noteId), {
    title: draft.title,
    tags: draft.tags,
    folderId: draft.folderId,
    pinned: draft.pinned,
    bodyText: draft.bodyText,
    bodyHtml: textToHtml(draft.bodyText),
    updatedAt: serverTimestamp(),
  });
}

export async function moveNotesToFolder(userId: string, noteIds: string[], folderId: string) {
  await Promise.all(
    noteIds.map((noteId) =>
      updateDoc(doc(db, "users", userId, "notes", noteId), {
        folderId,
        updatedAt: serverTimestamp(),
      })
    )
  );
}

export async function removeNote(userId: string, noteId: string) {
  await deleteDoc(doc(db, "users", userId, "notes", noteId));
}

export async function softDeleteNotes(userId: string, noteIds: string[]) {
  await Promise.all(noteIds.map((noteId) => softDeleteNote(userId, noteId)));
}

export async function softDeleteNote(userId: string, noteId: string) {
  await updateDoc(doc(db, "users", userId, "notes", noteId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreNote(userId: string, noteId: string) {
  await updateDoc(doc(db, "users", userId, "notes", noteId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}
