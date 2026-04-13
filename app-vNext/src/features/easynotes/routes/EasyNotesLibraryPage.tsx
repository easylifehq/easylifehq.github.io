import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

function formatDate(value: Date | null) {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function EasyNotesLibraryPage() {
  const navigate = useNavigate();
  const { notes, addNote, isLoading, error } = useEasyNotes();
  const [search, setSearch] = useState("");

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return notes;

    return notes.filter((note) =>
      [note.title, note.bodyText, ...note.tags].join(" ").toLowerCase().includes(term)
    );
  }, [notes, search]);

  async function handleCreateNote() {
    const noteId = await addNote();
    if (noteId) {
      navigate(`/app/easynotes/${noteId}`);
    }
  }

  return (
    <>
      <PageSection
        eyebrow="EasyNotes"
        title="Notes"
      >
        <div className="notes-library-toolbar">
          <label className="field-stack notes-search-field">
            <span>Search notes</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, tags, and notes"
            />
          </label>

          <button type="button" className="primary-button" onClick={() => void handleCreateNote()}>
            Create Note
          </button>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}

        <div className="notes-library-grid">
          {isLoading ? <p className="helper-copy">Loading your notes...</p> : null}

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="empty-card-vnext notes-empty-card">
              <strong>No notes yet</strong>
              <p className="helper-copy">Create your first note.</p>
            </div>
          ) : null}

          {filteredNotes.map((note) => (
            <Link key={note.id} to={`/app/easynotes/${note.id}`} className="note-card-vnext">
              <div className="note-card-top">
                <div>
                  <strong>{note.title.trim() || "Untitled note"}</strong>
                  <p>{formatDate(note.updatedAt || note.createdAt)}</p>
                </div>
                {note.pinned ? <span className="note-pin-badge">Pinned</span> : null}
              </div>

              <p className="note-card-body">{note.bodyText.trim() || "No content yet."}</p>

              {note.tags.length ? (
                <div className="note-tag-row">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="chip-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </PageSection>

      <button
        type="button"
        className="notes-create-fab"
        aria-label="Create note"
        onClick={() => void handleCreateNote()}
      >
        +
      </button>
    </>
  );
}
