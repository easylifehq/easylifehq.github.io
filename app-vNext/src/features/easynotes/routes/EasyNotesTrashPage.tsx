import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

function formatDate(value: Date | null) {
  if (!value) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function EasyNotesTrashPage() {
  const { deletedNotes, isLoading, error, restoreNote, permanentlyDeleteNote } = useEasyNotes();
  const [busyNoteId, setBusyNoteId] = useState("");
  const [search, setSearch] = useState("");

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return deletedNotes;

    return deletedNotes.filter((note) =>
      [note.title, note.bodyText, ...note.tags].join(" ").toLowerCase().includes(term)
    );
  }, [deletedNotes, search]);

  async function handleRestore(noteId: string) {
    setBusyNoteId(noteId);
    await restoreNote(noteId);
    setBusyNoteId("");
  }

  async function handlePermanentDelete(noteId: string) {
    const confirmed = window.confirm("Permanently delete this note? This cannot be undone.");
    if (!confirmed) return;

    setBusyNoteId(noteId);
    await permanentlyDeleteNote(noteId);
    setBusyNoteId("");
  }

  return (
    <PageSection eyebrow="EasyNotes" title="Recently deleted">
      <div className="notes-library-toolbar">
        <label className="field-stack notes-search-field">
          <span>Search deleted notes</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search deleted notes"
          />
        </label>

        <Link to="/app/easynotes" className="button-secondary">
          Back to notes
        </Link>
      </div>

      {error ? <p className="error-copy">{error}</p> : null}

      <div className="notes-library-grid">
        {isLoading ? <p className="helper-copy">Loading deleted notes...</p> : null}

        {!isLoading && filteredNotes.length === 0 ? (
          <div className="empty-card-vnext notes-empty-card">
            <strong>No deleted notes</strong>
            <p className="helper-copy">Deleted notes will wait here before they are gone for good.</p>
          </div>
        ) : null}

        {filteredNotes.map((note) => (
          <article key={note.id} className="note-card-vnext note-card-trash">
            <div className="note-card-top">
              <div>
                <strong>{note.title.trim() || "Untitled note"}</strong>
                <p>Deleted {formatDate(note.deletedAt)}</p>
              </div>
            </div>

            <p className="note-card-body">{note.bodyText.trim() || "No content yet."}</p>

            <div className="notes-trash-actions">
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => void handleRestore(note.id)}
                disabled={busyNoteId === note.id}
              >
                {busyNoteId === note.id ? "Restoring..." : "Restore"}
              </button>
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={() => void handlePermanentDelete(note.id)}
                disabled={busyNoteId === note.id}
              >
                Delete forever
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
