import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

const lastOpenNoteStorageKey = "easynotes:lastOpenNoteId";

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
    renameFolder,
    deleteFolder,
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
  const [lastOpenNoteId] = useState(() => window.localStorage.getItem(lastOpenNoteStorageKey) || "");

  const folderNameById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder.name])),
    [folders]
  );

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

  const lastOpenNote = useMemo(
    () => notes.find((note) => note.id === lastOpenNoteId) || notes[0] || null,
    [notes, lastOpenNoteId]
  );

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

  async function handleRenameFolder() {
    if (!selectedFolderId) return;
    const currentFolder = folders.find((folder) => folder.id === selectedFolderId);
    const folderName = window.prompt("Folder name", currentFolder?.name || "");
    if (!folderName?.trim()) return;

    await renameFolder(selectedFolderId, folderName);
  }

  async function handleDeleteFolder() {
    if (!selectedFolderId) return;
    const currentFolder = folders.find((folder) => folder.id === selectedFolderId);
    const confirmed = window.confirm(
      `Delete ${currentFolder?.name || "this folder"}? Notes inside it will move to No folder.`
    );
    if (!confirmed) return;

    await deleteFolder(selectedFolderId);
    setSelectedFolderId("");
    setSelectedNoteIds([]);
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
    const confirmed = window.confirm(
      `Move ${selectedNoteIds.length} selected note${selectedNoteIds.length === 1 ? "" : "s"} to Recently deleted?`
    );
    if (!confirmed) return;

    await deleteNotes(selectedNoteIds);
    setSelectedNoteIds([]);
  }

  function handleSelectVisible() {
    setSelectedNoteIds(filteredNotes.map((note) => note.id));
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
            {lastOpenNote ? (
              <Link to={`/app/easynotes/${lastOpenNote.id}`} className="primary-button">
                Resume writing
              </Link>
            ) : null}
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
            <div className="notes-bulk-bar">
              {selectedFolderId ? (
                <>
                  <button type="button" className="ghost-button compact-button" onClick={() => void handleRenameFolder()}>
                    Rename folder
                  </button>
                  <button type="button" className="ghost-button compact-button" onClick={() => void handleDeleteFolder()}>
                    Delete folder
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={handleSelectVisible}
                disabled={!filteredNotes.length}
              >
                Select visible
              </button>
            </div>
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
            <article
              key={note.id}
              className={`note-card-vnext note-card-selectable${selectedNoteIds.includes(note.id) ? " note-card-selected" : ""}`}
            >
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
                <div className="note-card-badges">
                  {note.folderId && folderNameById.get(note.folderId) ? (
                    <span className="note-folder-badge">{folderNameById.get(note.folderId)}</span>
                  ) : null}
                  {note.pinned ? <span className="note-pin-badge">Pinned</span> : null}
                </div>
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
