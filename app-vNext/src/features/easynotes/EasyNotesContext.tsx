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
  removeNote,
  subscribeToNotes,
  updateNote,
  type NoteDraft,
  type NoteRecord,
} from "@/lib/firestore/notes";
import { createTask, type TaskDraft } from "@/lib/firestore/tasks";
import { useAuth } from "@/features/auth/AuthContext";

type EasyNotesContextValue = {
  notes: NoteRecord[];
  isLoading: boolean;
  error: string;
  addNote: () => Promise<string | null>;
  saveNote: (noteId: string, draft: NoteDraft) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
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

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).get("visualQa") === "1";
}

const visualQaNotes: NoteRecord[] = [
  {
    id: "visual-note",
    title: "Launch notes and next actions",
    tags: ["inbox", "planning"],
    pinned: true,
    bodyHtml: "",
    bodyText:
      "Review the EasyLife polish pass\nFollow up on deployment notes\nSchedule a final mobile QA check\nDraft a short product update",
    createdAt: new Date("2026-04-12T09:00:00"),
    updatedAt: new Date("2026-04-12T10:30:00"),
  },
];

export function EasyNotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisualQaMode()) {
      setNotes(visualQaNotes);
      setIsLoading(false);
      setError("");
      return;
    }

    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToNotes(
      user.uid,
      (nextNotes) => {
        setNotes(sortNotes(nextNotes));
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(nextError.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function addNoteForUser() {
    if (!user) return null;
    const noteId = await createNote(user.uid);
    const optimisticNote: NoteRecord = {
      id: noteId,
      title: "",
      tags: [],
      pinned: false,
      bodyHtml: "",
      bodyText: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes((current) => {
      if (current.some((note) => note.id === noteId)) {
        return current;
      }

      return sortNotes([optimisticNote, ...current]);
    });

    return noteId;
  }

  async function saveNoteForUser(noteId: string, draft: NoteDraft) {
    if (!user) return;
    await updateNote(user.uid, noteId, draft);
  }

  async function deleteNoteForUser(noteId: string) {
    if (!user) return;
    await removeNote(user.uid, noteId);
    setNotes((current) => current.filter((note) => note.id !== noteId));
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
      isLoading,
      error,
      addNote: addNoteForUser,
      saveNote: saveNoteForUser,
      deleteNote: deleteNoteForUser,
      createTaskDraftsFromText: createTaskDraftsFromNote,
    }),
    [notes, isLoading, error]
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
