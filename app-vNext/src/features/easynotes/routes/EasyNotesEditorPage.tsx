import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";
import { useSettings } from "@/features/settings/SettingsContext";

const lastOpenNoteStorageKey = "easynotes:lastOpenNoteId";

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
  const [saveMessage, setSaveMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [processorMessage, setProcessorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const hydratedNoteIdRef = useRef<string | null>(null);
  const noteMetaRef = useRef({ tags: [] as string[], pinned: false });
  const lastSavedDraftRef = useRef({ noteId: "", title: "", bodyText: "", folderId: "" });

  useEffect(() => {
    if (!note) return;

    noteMetaRef.current = {
      tags: note.tags,
      pinned: note.pinned,
    };

    if (hydratedNoteIdRef.current === note.id) return;

    setTitle(note.title);
    setBodyText(note.bodyText);
    setFolderId(note.folderId);
    setSaveMessage("");
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
    if (hydratedNoteIdRef.current !== activeNoteId) return;
    if (
      lastSavedDraftRef.current.noteId === activeNoteId &&
      lastSavedDraftRef.current.title === title &&
      lastSavedDraftRef.current.bodyText === bodyText &&
      lastSavedDraftRef.current.folderId === folderId
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

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
        setSaveMessage("");
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
          <p className="eyebrow">EasyNotes</p>
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

  function handleProcessNote() {
    const nextSuggestions = extractActionSuggestions(bodyText);
    setSuggestions(nextSuggestions);
    setProcessorMessage(
      nextSuggestions.length
        ? `${nextSuggestions.length} possible action${nextSuggestions.length === 1 ? "" : "s"} found.`
        : "No obvious action items found yet."
    );
  }

  async function handleCreateTasksFromNote() {
    if (!note || isCreatingTasks) return;
    setIsCreatingTasks(true);
    const count = await createTaskDraftsFromText({
      noteTitle: title || note.title,
      text: suggestions.length ? suggestions.join("\n") : bodyText,
    });
    setIsCreatingTasks(false);
    setSuggestions([]);
    setProcessorMessage(
      count
        ? `${count} task${count === 1 ? "" : "s"} sent to EasyList.`
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
        ? `Created an EasyProject with ${result.taskCount} linked task${
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
          {saveMessage ? <span>{saveMessage}</span> : null}
          <button
            type="button"
            className={`button-secondary compact-button${actionsOpen ? " active" : ""}`}
            onClick={() => setActionsOpen((current) => !current)}
          >
            Actions
          </button>
        </div>
      </div>

      <div className="notes-editor-page notes-editor-page-immersive">
        <label className="notes-title-field">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled note"
          />
        </label>

        <label className="notes-body-field">
          <textarea
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            placeholder="Start writing..."
            rows={Math.max(28, bodyText.split(/\r?\n/).length + 4)}
          />
        </label>

        {actionsOpen ? (
          <aside className="advanced-disclosure notes-editor-action-panel">
            <strong>Use this note</strong>
            <div className="notes-editor-action-grid">
              {isExperimentalFeatureEnabled("notesProcessor") ? (
                <button type="button" className="button-secondary compact-button" onClick={handleProcessNote}>
                  Process note
                </button>
              ) : null}
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => void handleCreateTasksFromNote()}
                disabled={isCreatingTasks || !bodyText.trim()}
              >
                {isCreatingTasks ? "Sending..." : "Make tasks"}
              </button>
              <button
                type="button"
                className="button-secondary compact-button"
                onClick={() => void handleCreateProjectFromNote()}
                disabled={isCreatingProject || !bodyText.trim()}
              >
                {isCreatingProject ? "Creating..." : "Make project"}
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

        {isExperimentalFeatureEnabled("notesProcessor") && (processorMessage || suggestions.length) ? (
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
                  <span className="helper-copy">Ready for EasyList</span>
                </article>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
