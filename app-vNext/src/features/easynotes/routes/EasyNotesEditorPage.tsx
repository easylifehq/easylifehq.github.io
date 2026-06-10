import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";
import { useSettings } from "@/features/settings/SettingsContext";

const lastOpenNoteStorageKey = "easynotes:lastOpenNoteId";
const NOTE_EDITOR_DRAFT_PREFIX = "easylife.easynotes.editorDraft.";
type NoteSaveStatus = "idle" | "saving" | "saved" | "saved-recent" | "failed";
type StoredNoteEditorDraft = {
  noteId: string;
  title: string;
  bodyText: string;
  folderId: string;
  savedAt: number;
};

function extractActionSuggestions(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*+]\s*/, "").replace(/^\[[ xX]\]\s*/, ""))
    .filter((line) =>
      /\b(todo|to do|need to|should|follow up|email|call|text|schedule|finish|submit|buy|draft|review)\b/i.test(line)
    )
    .map((line) => line.replace(/^(todo|to do)\s*:?\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function getNoteEditorDraftKey(noteId: string) {
  return `${NOTE_EDITOR_DRAFT_PREFIX}${noteId}`;
}

function readNoteEditorDraft(noteId: string): StoredNoteEditorDraft | null {
  if (typeof window === "undefined" || !noteId) return null;

  try {
    const rawValue = window.localStorage.getItem(getNoteEditorDraftKey(noteId));
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue) as Partial<StoredNoteEditorDraft>;

    if (parsed.noteId !== noteId) return null;

    return {
      noteId,
      title: typeof parsed.title === "string" ? parsed.title : "",
      bodyText: typeof parsed.bodyText === "string" ? parsed.bodyText : "",
      folderId: typeof parsed.folderId === "string" ? parsed.folderId : "",
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return null;
  }
}

function writeNoteEditorDraft(draft: Omit<StoredNoteEditorDraft, "savedAt">) {
  if (typeof window === "undefined" || !draft.noteId) return;

  window.localStorage.setItem(
    getNoteEditorDraftKey(draft.noteId),
    JSON.stringify({
      ...draft,
      savedAt: Date.now(),
    })
  );
}

function clearNoteEditorDraft(noteId: string) {
  if (typeof window === "undefined" || !noteId) return;

  window.localStorage.removeItem(getNoteEditorDraftKey(noteId));
}

export function EasyNotesEditorPage() {
  const navigate = useNavigate();
  const { noteId = "" } = useParams();
  const { notes, folders, isLoading, saveNote, deleteNote, createTaskDraftsFromText, createProjectFromText } = useEasyNotes();
  const { isExperimentalFeatureEnabled } = useSettings();
  const note = useMemo(() => notes.find((entry) => entry.id === noteId) || null, [notes, noteId]);
  const activeNoteId = note?.id || "";
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [folderId, setFolderId] = useState("");
  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);
  const [processorMessage, setProcessorMessage] = useState("");
  const [restoredDraftMessage, setRestoredDraftMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const saveRequestRef = useRef(0);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hydratedNoteIdRef = useRef<string | null>(null);
  const noteMetaRef = useRef({ tags: [] as string[], pinned: false });
  const lastSavedDraftRef = useRef({ noteId: "", title: "", bodyText: "", folderId: "" });
  const actionSuggestions = useMemo(() => extractActionSuggestions(bodyText), [bodyText]);
  const reviewCount = actionSuggestions.length;

  useEffect(() => {
    if (!note) return;

    noteMetaRef.current = {
      tags: note.tags,
      pinned: note.pinned,
    };

    if (hydratedNoteIdRef.current === note.id) return;

    const localDraft = readNoteEditorDraft(note.id);
    const shouldRestoreLocalDraft = Boolean(
      localDraft &&
      (localDraft.title !== note.title ||
        localDraft.bodyText !== note.bodyText ||
        localDraft.folderId !== note.folderId)
    );
    const restoredLocalDraft = shouldRestoreLocalDraft ? localDraft : null;

    setTitle(restoredLocalDraft ? restoredLocalDraft.title : note.title);
    setBodyText(restoredLocalDraft ? restoredLocalDraft.bodyText : note.bodyText);
    setFolderId(restoredLocalDraft ? restoredLocalDraft.folderId : note.folderId);
    setSaveStatus(note.title.trim() || note.bodyText.trim() ? "saved" : "idle");
    setProcessorMessage("");
    setRestoredDraftMessage(shouldRestoreLocalDraft ? "Restored unsaved note draft from this browser." : "");
    setSuggestions([]);
    setActionsOpen(false);
    hydratedNoteIdRef.current = note.id;
    lastSavedDraftRef.current = {
      noteId: note.id,
      title: note.title,
      bodyText: note.bodyText,
      folderId: note.folderId,
    };
  }, [note]);

  useEffect(() => {
    if (!activeNoteId) return;
    window.localStorage.setItem(lastOpenNoteStorageKey, activeNoteId);
  }, [activeNoteId]);

  useEffect(() => {
    if (!activeNoteId) return;
    window.setTimeout(() => bodyTextareaRef.current?.focus(), 0);
  }, [activeNoteId]);

  useEffect(() => {
    if (!activeNoteId) return;
    if (hydratedNoteIdRef.current !== activeNoteId) return;
    if (
      lastSavedDraftRef.current.noteId === activeNoteId &&
      lastSavedDraftRef.current.title === title &&
      lastSavedDraftRef.current.bodyText === bodyText &&
      lastSavedDraftRef.current.folderId === folderId
    ) {
      clearNoteEditorDraft(activeNoteId);
      return;
    }

    writeNoteEditorDraft({
      noteId: activeNoteId,
      title,
      bodyText,
      folderId,
    });

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");
    const saveRequestId = saveRequestRef.current + 1;
    saveRequestRef.current = saveRequestId;

    saveTimeoutRef.current = window.setTimeout(() => {
      void saveNote(activeNoteId, {
        title: title.trim(),
        tags: noteMetaRef.current.tags,
        folderId,
        pinned: noteMetaRef.current.pinned,
        bodyText,
      }).then(() => {
        lastSavedDraftRef.current = {
          noteId: activeNoteId,
          title,
          bodyText,
          folderId,
        };
        clearNoteEditorDraft(activeNoteId);
        if (saveRequestRef.current === saveRequestId) {
          setSaveStatus("saved-recent");
          setRestoredDraftMessage("");
        }
      }).catch(() => {
        if (saveRequestRef.current === saveRequestId) {
          setSaveStatus("failed");
        }
      });
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, bodyText, folderId, activeNoteId, saveNote]);

  if (!isLoading && !note) {
    return (
      <section className="panel-section">
        <div className="panel-header">
          <p className="eyebrow">Notes</p>
          <h2>Note not found</h2>
          <p>This note may have been deleted or hasn&apos;t synced yet.</p>
        </div>
        <Link to="/app/easynotes" className="button-secondary">
          Back to notes
        </Link>
      </section>
    );
  }

  async function handleDelete() {
    if (!note) return;
    setIsDeleting(true);
    await deleteNote(note.id);
    navigate("/app/easynotes");
  }

  const saveLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "saved-recent"
          ? "Saved just now"
          : saveStatus === "failed"
            ? "Save failed"
            : "Start writing";

  function handleProcessNote() {
    const nextSuggestions = extractActionSuggestions(bodyText);
    setSuggestions(nextSuggestions);
    setProcessorMessage(
      nextSuggestions.length
        ? `${nextSuggestions.length} possible action${nextSuggestions.length === 1 ? "" : "s"} found.`
        : "No obvious action items found yet."
    );
  }

  function handleReviewFollowUps() {
    if (actionsOpen) {
      setProcessorMessage("");
      setSuggestions([]);
      setActionsOpen(false);
      return;
    }

    const nextSuggestions = extractActionSuggestions(bodyText);
    setActionsOpen(true);
    setSuggestions(nextSuggestions);
    setProcessorMessage(
      nextSuggestions.length
        ? `Review ${nextSuggestions.length} follow-up${nextSuggestions.length === 1 ? "" : "s"} before adding.`
        : "No clear follow-up found yet. You can still add each note line as a task."
    );
  }

  async function handleCreateTasksFromNote() {
    if (!note || isCreatingTasks) return;
    setIsCreatingTasks(true);
    const count = await createTaskDraftsFromText({
      noteTitle: title || note.title,
      text: actionSuggestions.length ? actionSuggestions.join("\n") : bodyText,
    });
    setIsCreatingTasks(false);
    setSuggestions([]);
    setProcessorMessage(
      count
        ? `${count} task${count === 1 ? "" : "s"} added to Inbox.`
        : "Write each task on its own line, then try again."
    );
  }

  async function handleCreateProjectFromNote() {
    if (!note || isCreatingProject) return;
    setIsCreatingProject(true);
    const result = await createProjectFromText({
      noteTitle: title || note.title,
      text: suggestions.length ? suggestions.join("\n") : bodyText,
    });
    setIsCreatingProject(false);
    setSuggestions([]);
    setProcessorMessage(
      result
        ? `Created a project with ${result.taskCount} linked task${
            result.taskCount === 1 ? "" : "s"
          }.`
        : "Write a project outline with one action per line, then try again."
    );
  }

  return (
    <section className="notes-editor-shell notes-editor-shell-immersive">
      <div className="notes-editor-topbar">
        <Link to="/app/easynotes" className="button-secondary">
          Back
        </Link>
        <div className="notes-editor-status notes-editor-tools">
          <span className={`notes-save-status notes-save-status-${saveStatus}`} role="status" aria-live="polite">
            {saveLabel}
          </span>
          <button
            type="button"
            className={`button-secondary compact-button notes-review-action-button${actionsOpen ? " active" : ""}`}
            onClick={handleReviewFollowUps}
            disabled={!actionsOpen && !bodyText.trim()}
          >
            {actionsOpen ? "Hide follow-ups" : `Review follow-ups${reviewCount ? ` (${reviewCount})` : ""}`}
          </button>
        </div>
      </div>

      <div className="notes-editor-page notes-editor-page-immersive">
        <label className="notes-title-field">
          <span>Title optional</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled note"
            aria-label="Note title, optional"
          />
        </label>

        <label className="notes-body-field">
          <span>Write first</span>
          {restoredDraftMessage ? <div className="calendar-info-card">{restoredDraftMessage}</div> : null}
          <div className="calendar-info-card" aria-label="Note recovery and export boundary">
            Browser recovery is on while autosave catches up. EasyLife keeps a temporary browser-only note draft,
            clears it after a successful save, and does not send, sync, export, or use AI from this editor.
          </div>
          <textarea
            ref={bodyTextareaRef}
            value={bodyText}
            onChange={(event) => {
              setBodyText(event.target.value);
              setSuggestions([]);
              setProcessorMessage("");
            }}
            placeholder="Start writing..."
            aria-label="Note body"
            rows={Math.max(28, bodyText.split(/\r?\n/).length + 4)}
          />
        </label>

        {actionsOpen ? (
          <aside className="advanced-disclosure notes-editor-action-panel">
            <div className="notes-action-panel-heading">
              <strong>Turn note into follow-ups</strong>
              <p className="helper-copy">
                Review what should become tasks. Nothing is added to Inbox until you approve.
              </p>
              {processorMessage ? <p className="helper-copy">{processorMessage}</p> : null}
            </div>
            {suggestions.length ? (
              <div className="notes-action-review-list" aria-label="Suggested follow-ups">
                {suggestions.map((suggestion, index) => (
                  <span key={`${suggestion}-${index}`}>{suggestion}</span>
                ))}
              </div>
            ) : null}
            <div className="notes-editor-action-grid">
              {isExperimentalFeatureEnabled("notesProcessor") ? (
                <button type="button" className="button-secondary compact-button" onClick={handleProcessNote}>
                  Find action lines
                </button>
              ) : null}
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => void handleCreateTasksFromNote()}
                disabled={isCreatingTasks || !bodyText.trim()}
              >
                {isCreatingTasks ? "Adding..." : "Add follow-ups to Inbox"}
              </button>
              <button
                type="button"
                className="button-secondary compact-button"
                onClick={() => void handleCreateProjectFromNote()}
                disabled={isCreatingProject || !bodyText.trim()}
              >
                {isCreatingProject ? "Creating..." : "Create project"}
              </button>
            </div>
            <label className="field-stack notes-editor-folder-field">
              <span>Folder</span>
              <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ghost-button notes-delete-button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Moving..." : "Move to recently deleted"}
            </button>
          </aside>
        ) : null}

        {!actionsOpen && isExperimentalFeatureEnabled("notesProcessor") && (processorMessage || suggestions.length) ? (
          <aside className="notes-processor-panel">
            <div>
              <p className="eyebrow">Experimental</p>
              <h3>Note processor</h3>
              <p>{processorMessage}</p>
            </div>
            <div className="task-list-vnext">
              {suggestions.map((suggestion) => (
                <article key={suggestion} className="mini-panel-vnext processor-suggestion">
                  <strong>{suggestion}</strong>
                  <span className="helper-copy">Ready for Inbox</span>
                </article>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
