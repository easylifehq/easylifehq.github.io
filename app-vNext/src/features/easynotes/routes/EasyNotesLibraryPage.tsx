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
  const {
    notes,
    folders,
    addNote,
    addFolder,
    deleteNotes,
    moveNotesToFolder,
    cleanUpEmptyNotes,
    isLoading,
    error,
  } = useEasyNotes();
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [bulkFolderId, setBulkFolderId] = useState("");
  const [cleanupMessage, setCleanupMessage] = useState("");

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesFolder = selectedFolderId ? note.folderId === selectedFolderId : true;
      const matchesSearch = term
        ? [note.title, note.bodyText, ...note.tags].join(" ").toLowerCase().includes(term)
        : true;

      return matchesFolder && matchesSearch;
    });
  }, [notes, search, selectedFolderId]);

  async function handleCreateNote() {
    const noteId = await addNote();
    if (noteId) {
      navigate(`/app/easynotes/${noteId}`);
    }
  }

  async function handleCreateFolder() {
    const folderName = window.prompt("Folder name");
    if (!folderName?.trim()) return;

    const folderId = await addFolder(folderName);
    if (folderId) {
      setSelectedFolderId(folderId);
    }
  }

  function toggleSelectedNote(noteId: string) {
    setSelectedNoteIds((current) =>
      current.includes(noteId) ? current.filter((id) => id !== noteId) : [...current, noteId]
    );
  }

  async function handleBulkMove() {
    if (!selectedNoteIds.length) return;
    await moveNotesToFolder(selectedNoteIds, bulkFolderId);
    setSelectedNoteIds([]);
    setBulkFolderId("");
  }

  async function handleBulkDelete() {
    if (!selectedNoteIds.length) return;
    await deleteNotes(selectedNoteIds);
    setSelectedNoteIds([]);
  }

  async function handleCleanup() {
    const count = await cleanUpEmptyNotes();
    setCleanupMessage(
      count
        ? `${count} empty untitled note${count === 1 ? "" : "s"} moved to Recently deleted.`
        : "No empty untitled notes to clean up."
    );
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

          <div className="notes-toolbar-actions">
            <button type="button" className="button-secondary" onClick={() => void handleCreateFolder()}>
              New folder
            </button>
            <button type="button" className="button-secondary" onClick={() => void handleCleanup()}>
              Clean up empty notes
            </button>
            <Link to="/app/easynotes/trash" className="button-secondary">
              Recently deleted
            </Link>
            <button type="button" className="primary-button" onClick={() => void handleCreateNote()}>
              Create Note
            </button>
          </div>
        </div>

        <div className="notes-control-center">
          <label className="field-stack">
            <span>Folder</span>
            <select
              value={selectedFolderId}
              onChange={(event) => {
                setSelectedFolderId(event.target.value);
                setSelectedNoteIds([]);
              }}
            >
              <option value="">All notes</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>

          {selectedNoteIds.length ? (
            <div className="notes-bulk-bar">
              <strong>
                {selectedNoteIds.length} selected
              </strong>
              <select value={bulkFolderId} onChange={(event) => setBulkFolderId(event.target.value)}>
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button type="button" className="primary-button compact-button" onClick={() => void handleBulkMove()}>
                Move
              </button>
              <button type="button" className="ghost-button compact-button" onClick={() => void handleBulkDelete()}>
                Move to deleted
              </button>
              <button type="button" className="ghost-button compact-button" onClick={() => setSelectedNoteIds([])}>
                Clear
              </button>
            </div>
          ) : (
            <p className="helper-copy notes-control-helper">
              Select notes to move them into folders or send them to Recently deleted.
            </p>
          )}
        </div>

        {error ? <p className="error-copy">{error}</p> : null}
        {cleanupMessage ? <p className="helper-copy">{cleanupMessage}</p> : null}

        <div className="notes-library-grid">
          {isLoading ? <p className="helper-copy">Loading your notes...</p> : null}

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="empty-card-vnext notes-empty-card">
              <strong>No notes yet</strong>
              <p className="helper-copy">Create your first note.</p>
            </div>
          ) : null}

          {filteredNotes.map((note) => (
            <article key={note.id} className="note-card-vnext note-card-selectable">
              <label className="notes-select-row">
                <input
                  type="checkbox"
                  checked={selectedNoteIds.includes(note.id)}
                  onChange={() => toggleSelectedNote(note.id)}
                />
                <span>Select</span>
              </label>
              <Link to={`/app/easynotes/${note.id}`} className="note-card-link">
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
            </article>
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
