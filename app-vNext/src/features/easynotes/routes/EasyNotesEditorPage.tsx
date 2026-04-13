import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { createTask } from "@/lib/firestore/tasks";
import { auth } from "@/lib/firebase/client";

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
  const { notes, isLoading, saveNote, deleteNote } = useEasyNotes();
  const { isExperimentalFeatureEnabled } = useSettings();
  const note = useMemo(() => notes.find((entry) => entry.id === noteId) || null, [notes, noteId]);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [processorMessage, setProcessorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const saveTimeoutRef = useRef<number | null>(null);
  const hydratedNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!note) return;

    setTitle(note.title);
    setBodyText(note.bodyText);
    setSaveMessage("");
    hydratedNoteIdRef.current = note.id;
  }, [note]);

  useEffect(() => {
    if (!note) return;
    if (hydratedNoteIdRef.current !== note.id) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void saveNote(note.id, {
        title: title.trim(),
        tags: note.tags,
        pinned: note.pinned,
        bodyText,
      }).then(() => {
        setSaveMessage("");
      });
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, bodyText, note, saveNote]);

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

  async function createSuggestedTask(title: string) {
    const user = auth.currentUser;
    if (!user) return;

    await createTask(user.uid, {
      title,
      notes: `Extracted from note: ${title || note?.title || "Untitled note"}`,
      category: "Notes",
      estimatedLength: null,
      priorityTier: 3,
      priorityLabel: "Medium",
      dueDate: null,
      recurring: false,
    });
    setSuggestions((current) => current.filter((entry) => entry !== title));
    setProcessorMessage("Task created. Nothing else was auto-created.");
  }

  return (
    <section className="notes-editor-shell notes-editor-shell-immersive">
      <div className="notes-editor-topbar">
        <Link to="/app/easynotes" className="button-secondary">
          Back
        </Link>
        <div className="notes-editor-status notes-editor-tools">
          {isExperimentalFeatureEnabled("notesProcessor") ? (
            <button type="button" className="button-secondary compact-button" onClick={handleProcessNote}>
              Process note
            </button>
          ) : null}
          {saveMessage ? <span>{saveMessage}</span> : null}
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
            rows={28}
          />
        </label>

        <button
          type="button"
          className="ghost-button notes-delete-button"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete note"}
        </button>

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
                  <button type="button" className="primary-button compact-button" onClick={() => void createSuggestedTask(suggestion)}>
                    Create task
                  </button>
                </article>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
