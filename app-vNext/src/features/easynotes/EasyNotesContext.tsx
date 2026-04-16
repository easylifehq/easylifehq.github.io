import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createNote,
  createNoteFolder,
  moveNotesToFolder,
  removeNote,
  restoreNote,
  softDeleteNote,
  softDeleteNotes,
  subscribeToNoteFolders,
  subscribeToNotes,
  updateNote,
  type NoteDraft,
  type NoteFolderRecord,
  type NoteRecord,
} from "@/lib/firestore/notes";
import { createTask, type TaskDraft } from "@/lib/firestore/tasks";
import { useAuth } from "@/features/auth/AuthContext";

type EasyNotesContextValue = {
  notes: NoteRecord[];
  deletedNotes: NoteRecord[];
  folders: NoteFolderRecord[];
  isLoading: boolean;
  error: string;
  addNote: () => Promise<string | null>;
  addFolder: (name: string) => Promise<string | null>;
  saveNote: (noteId: string, draft: NoteDraft) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteNotes: (noteIds: string[]) => Promise<void>;
  moveNotesToFolder: (noteIds: string[], folderId: string) => Promise<void>;
  cleanUpEmptyNotes: () => Promise<number>;
  restoreNote: (noteId: string) => Promise<void>;
  permanentlyDeleteNote: (noteId: string) => Promise<void>;
  createTaskDraftsFromText: (payload: { noteTitle: string; text: string }) => Promise<number>;
};

const EasyNotesContext = createContext<EasyNotesContextValue | undefined>(undefined);

function normalizeLinesToTasks(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]?\s*(\[[ xX]\])?\s*/, "").trim())
    .filter(Boolean)
    .filter((line) => line.length > 2)
    .slice(0, 12);
}

function sortNotes(notes: NoteRecord[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return Number(b.pinned) - Number(a.pinned);
    }

    const aTime = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
    const bTime = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
    return bTime - aTime;
  });
}

function sortFolders(folders: NoteFolderRecord[]) {
  return [...folders].sort((a, b) => a.name.localeCompare(b.name));
}

function isEmptyUntitledNote(note: NoteRecord) {
  return !note.title.trim() && !note.bodyText.trim() && note.tags.length === 0 && !note.folderId;
}

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).get("visualQa") === "1";
}

const visualQaNotes: NoteRecord[] = [
  {
    id: "visual-note",
    title: "Launch notes and next actions",
    tags: ["inbox", "planning"],
    folderId: "",
    pinned: true,
    bodyHtml: "",
    bodyText:
      "Review the EasyLife polish pass\nFollow up on deployment notes\nSchedule a final mobile QA check\nDraft a short product update",
    createdAt: new Date("2026-04-12T09:00:00"),
    updatedAt: new Date("2026-04-12T10:30:00"),
    deletedAt: null,
  },
];

export function EasyNotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<NoteRecord[]>([]);
  const [folders, setFolders] = useState<NoteFolderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisualQaMode()) {
      setNotes(visualQaNotes);
      setDeletedNotes([]);
      setFolders([]);
      setIsLoading(false);
      setError("");
      return;
    }

    if (!user) {
      setNotes([]);
      setDeletedNotes([]);
      setFolders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribeNotes = subscribeToNotes(
      user.uid,
      (nextNotes) => {
        setNotes(sortNotes(nextNotes.filter((note) => !note.deletedAt)));
        setDeletedNotes(sortNotes(nextNotes.filter((note) => note.deletedAt)));
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(nextError.message);
        setIsLoading(false);
      }
    );

    const unsubscribeFolders = subscribeToNoteFolders(
      user.uid,
      (nextFolders) => {
        setFolders(sortFolders(nextFolders));
      },
      (nextError) => {
        setError(nextError.message);
      }
    );

    return () => {
      unsubscribeNotes();
      unsubscribeFolders();
    };
  }, [user]);

  async function addNoteForUser() {
    if (!user) return null;
    const noteId = await createNote(user.uid);
    const optimisticNote: NoteRecord = {
      id: noteId,
      title: "",
      tags: [],
      folderId: "",
      pinned: false,
      bodyHtml: "",
      bodyText: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    setNotes((current) => {
      if (current.some((note) => note.id === noteId)) {
        return current;
      }

      return sortNotes([optimisticNote, ...current]);
    });

    return noteId;
  }

  async function addFolderForUser(name: string) {
    if (!user) return null;
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const folderId = await createNoteFolder(user.uid, trimmedName);
    const optimisticFolder: NoteFolderRecord = {
      id: folderId,
      name: trimmedName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFolders((current) => sortFolders([...current, optimisticFolder]));
    return folderId;
  }

  async function saveNoteForUser(noteId: string, draft: NoteDraft) {
    if (!user) return;
    await updateNote(user.uid, noteId, draft);
  }

  async function deleteNoteForUser(noteId: string) {
    if (!user) return;
    await softDeleteNote(user.uid, noteId);
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  async function deleteNotesForUser(noteIds: string[]) {
    if (!user || !noteIds.length) return;
    await softDeleteNotes(user.uid, noteIds);
    setNotes((current) => current.filter((note) => !noteIds.includes(note.id)));
  }

  async function moveNotesToFolderForUser(noteIds: string[], folderId: string) {
    if (!user || !noteIds.length) return;
    await moveNotesToFolder(user.uid, noteIds, folderId);
    setNotes((current) =>
      sortNotes(current.map((note) => (noteIds.includes(note.id) ? { ...note, folderId } : note)))
    );
  }

  async function cleanUpEmptyNotesForUser() {
    if (!user) return 0;
    const emptyNoteIds = notes.filter(isEmptyUntitledNote).map((note) => note.id);
    if (!emptyNoteIds.length) return 0;

    await softDeleteNotes(user.uid, emptyNoteIds);
    setNotes((current) => current.filter((note) => !emptyNoteIds.includes(note.id)));
    return emptyNoteIds.length;
  }

  async function restoreNoteForUser(noteId: string) {
    if (!user) return;
    await restoreNote(user.uid, noteId);
    setDeletedNotes((current) => current.filter((note) => note.id !== noteId));
  }

  async function permanentlyDeleteNoteForUser(noteId: string) {
    if (!user) return;
    await removeNote(user.uid, noteId);
    setDeletedNotes((current) => current.filter((note) => note.id !== noteId));
  }

  async function createTaskDraftsFromNote(payload: { noteTitle: string; text: string }) {
    if (!user) return 0;

    const lines = normalizeLinesToTasks(payload.text);
    if (!lines.length) return 0;

    const drafts: TaskDraft[] = lines.map((line) => ({
      title: line,
      notes: `Drafted from EasyNotes: ${payload.noteTitle || "Untitled note"}`,
      category: "EasyNotes",
      estimatedLength: null,
      priorityTier: 3,
      priorityLabel: "Golden Gator",
      dueDate: null,
      recurring: false,
    }));

    await Promise.all(drafts.map((draft) => createTask(user.uid, draft)));
    return drafts.length;
  }

  const value = useMemo(
    () => ({
      notes,
      deletedNotes,
      folders,
      isLoading,
      error,
      addNote: addNoteForUser,
      addFolder: addFolderForUser,
      saveNote: saveNoteForUser,
      deleteNote: deleteNoteForUser,
      deleteNotes: deleteNotesForUser,
      moveNotesToFolder: moveNotesToFolderForUser,
      cleanUpEmptyNotes: cleanUpEmptyNotesForUser,
      restoreNote: restoreNoteForUser,
      permanentlyDeleteNote: permanentlyDeleteNoteForUser,
      createTaskDraftsFromText: createTaskDraftsFromNote,
    }),
    [notes, deletedNotes, folders, isLoading, error]
  );

  return <EasyNotesContext.Provider value={value}>{children}</EasyNotesContext.Provider>;
}

export function useEasyNotes() {
  const context = useContext(EasyNotesContext);

  if (!context) {
    throw new Error("useEasyNotes must be used inside EasyNotesProvider");
  }

  return context;
}
