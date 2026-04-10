import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesEditorPage() {
  const navigate = useNavigate();
  const { noteId = "" } = useParams();
  const { notes, isLoading, saveNote, deleteNote } = useEasyNotes();
  const note = useMemo(() => notes.find((entry) => entry.id === noteId) || null, [notes, noteId]);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [saveMessage, setSaveMessage] = useState("Saved");
  const [isDeleting, setIsDeleting] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const hydratedNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!note) return;

    setTitle(note.title);
    setBodyText(note.bodyText);
    setSaveMessage("Saved");
    hydratedNoteIdRef.current = note.id;
  }, [note]);

  useEffect(() => {
    if (!note) return;
    if (hydratedNoteIdRef.current !== note.id) return;

    setSaveMessage("Unsaved changes");

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
        setSaveMessage("Everything saved");
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

  return (
    <section className="notes-editor-shell notes-editor-shell-immersive">
      <div className="notes-editor-topbar">
        <Link to="/app/easynotes" className="button-secondary">
          Back
        </Link>
        <div className="notes-editor-status">
          <span>{saveMessage}</span>
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
      </div>
    </section>
  );
}
