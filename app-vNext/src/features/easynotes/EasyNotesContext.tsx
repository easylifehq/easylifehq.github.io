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
  deleteNoteFolder,
  moveNotesToFolder,
  removeNote,
  removeNotes,
  restoreNote,
  restoreNotes,
  softDeleteNote,
  softDeleteNotes,
  subscribeToNoteFolders,
  subscribeToNotes,
  updateNoteFolder,
  updateNote,
  type NoteDraft,
  type NoteFolderRecord,
  type NoteRecord,
} from "@/lib/firestore/notes";
import { createTask, type TaskDraft } from "@/lib/firestore/tasks";
import { createProject } from "@/lib/firestore/projects";
import { createProjectSection } from "@/lib/firestore/projectSections";
import { createProjectTaskLink } from "@/lib/firestore/projectTaskLinks";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";

type EasyNotesContextValue = {
  notes: NoteRecord[];
  deletedNotes: NoteRecord[];
  folders: NoteFolderRecord[];
  isLoading: boolean;
  error: string;
  addNote: () => Promise<string | null>;
  addFolder: (name: string) => Promise<string | null>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  saveNote: (noteId: string, draft: NoteDraft) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteNotes: (noteIds: string[]) => Promise<void>;
  moveNotesToFolder: (noteIds: string[], folderId: string) => Promise<void>;
  cleanUpEmptyNotes: () => Promise<number>;
  restoreNote: (noteId: string) => Promise<void>;
  restoreNotes: (noteIds: string[]) => Promise<void>;
  permanentlyDeleteNote: (noteId: string) => Promise<void>;
  permanentlyDeleteNotes: (noteIds: string[]) => Promise<void>;
  createTaskDraftsFromText: (payload: { noteTitle: string; text: string }) => Promise<number>;
  createProjectFromText: (payload: { noteTitle: string; text: string }) => Promise<{ projectId: string; taskCount: number } | null>;
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
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

const visualQaNotes: NoteRecord[] = [
  {
    id: "visual-note-brief",
    title: "Sunday reset brief",
    tags: ["inbox", "planning"],
    folderId: "",
    pinned: true,
    bodyHtml: "",
    bodyText:
      "Clear the overdue reply first\nPut the project update into a noon block\nUse the empty afternoon window for one focused pass\nSave errands for after the walk",
    createdAt: new Date("2026-05-03T08:40:00"),
    updatedAt: new Date("2026-05-03T09:12:00"),
    deletedAt: null,
  },
  {
    id: "visual-note-assistant",
    title: "Friday errands and receipts",
    tags: ["home", "errands"],
    folderId: "",
    pinned: false,
    bodyHtml: "",
    bodyText:
      "Move dentist receipt to notes\nAdd grocery list before Friday\nPlan tomorrow before lunch\nText Sam about Saturday pickup",
    createdAt: new Date("2026-05-02T17:15:00"),
    updatedAt: new Date("2026-05-02T18:05:00"),
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
        setError(toSafeFirebaseMessage(nextError));
        setIsLoading(false);
      }
    );

    const unsubscribeFolders = subscribeToNoteFolders(
      user.uid,
      (nextFolders) => {
        setFolders(sortFolders(nextFolders));
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
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

  async function renameFolderForUser(folderId: string, name: string) {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await updateNoteFolder(user.uid, folderId, trimmedName);
    setFolders((current) =>
      sortFolders(current.map((folder) => (folder.id === folderId ? { ...folder, name: trimmedName } : folder)))
    );
  }

  async function deleteFolderForUser(folderId: string) {
    if (!user) return;
    await Promise.all([
      deleteNoteFolder(user.uid, folderId),
      moveNotesToFolder(user.uid, notes.filter((note) => note.folderId === folderId).map((note) => note.id), ""),
    ]);
    setFolders((current) => current.filter((folder) => folder.id !== folderId));
    setNotes((current) =>
      sortNotes(current.map((note) => (note.folderId === folderId ? { ...note, folderId: "" } : note)))
    );
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

  async function restoreNotesForUser(noteIds: string[]) {
    if (!user || !noteIds.length) return;
    await restoreNotes(user.uid, noteIds);
    setDeletedNotes((current) => current.filter((note) => !noteIds.includes(note.id)));
  }

  async function permanentlyDeleteNoteForUser(noteId: string) {
    if (!user) return;
    await removeNote(user.uid, noteId);
    setDeletedNotes((current) => current.filter((note) => note.id !== noteId));
  }

  async function permanentlyDeleteNotesForUser(noteIds: string[]) {
    if (!user || !noteIds.length) return;
    await removeNotes(user.uid, noteIds);
    setDeletedNotes((current) => current.filter((note) => !noteIds.includes(note.id)));
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
      priorityTier: 5,
      priorityLabel: "Important",
      dueDate: null,
      recurring: false,
    }));

    await Promise.all(drafts.map((draft) => createTask(user.uid, draft)));
    return drafts.length;
  }

  async function createProjectFromNote(payload: { noteTitle: string; text: string }) {
    if (!user) return null;

    const lines = normalizeLinesToTasks(payload.text);
    if (!lines.length) return null;

    const projectTitle = payload.noteTitle.trim() || "Project from EasyNotes";
    const projectId = await createProject(user.uid, {
      title: projectTitle,
      description: [
        "Created from EasyNotes.",
        payload.text.trim() ? `Source note outline:\n${payload.text.trim()}` : "",
      ].filter(Boolean).join("\n\n"),
      targetDate: "",
      status: "active",
    });
    const sectionId = await createProjectSection(user.uid, {
      projectId,
      title: "From note",
      order: 1,
    });

    await Promise.all(
      lines.map(async (line, index) => {
        const taskId = await createTask(user.uid, {
          title: line,
          notes: `Created from EasyNotes project group: ${projectTitle}`,
          category: "EasyNotes",
          estimatedLength: null,
          priorityTier: 5,
          priorityLabel: "Important",
          dueDate: null,
          recurring: false,
        });

        await createProjectTaskLink(user.uid, {
          projectId,
          sectionId,
          taskId,
          order: index + 1,
          parentLabel: "Created from EasyNotes",
        });
      })
    );

    return { projectId, taskCount: lines.length };
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
      renameFolder: renameFolderForUser,
      deleteFolder: deleteFolderForUser,
      saveNote: saveNoteForUser,
      deleteNote: deleteNoteForUser,
      deleteNotes: deleteNotesForUser,
      moveNotesToFolder: moveNotesToFolderForUser,
      cleanUpEmptyNotes: cleanUpEmptyNotesForUser,
      restoreNote: restoreNoteForUser,
      restoreNotes: restoreNotesForUser,
      permanentlyDeleteNote: permanentlyDeleteNoteForUser,
      permanentlyDeleteNotes: permanentlyDeleteNotesForUser,
      createTaskDraftsFromText: createTaskDraftsFromNote,
      createProjectFromText: createProjectFromNote,
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
