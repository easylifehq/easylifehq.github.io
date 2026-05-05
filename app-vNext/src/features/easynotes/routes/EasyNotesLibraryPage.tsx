import { useMemo, useRef, useState } from "react";
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

function getMemoryCue(value: Date | null) {
  if (!value) return "Recent";

  const ageInDays = Math.floor((Date.now() - value.getTime()) / 86400000);

  if (ageInDays <= 2) return "Recent";
  if (ageInDays >= 14) return "Review soon";

  return "";
}

function renderMemoryCue(value: Date | null) {
  const cue = getMemoryCue(value);

  return cue ? <em className="note-memory-cue">{cue}</em> : null;
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastOpenNoteId] = useState(() => window.localStorage.getItem(lastOpenNoteStorageKey) || "");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const folderNameById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder.name])),
    [folders]
  );
  const pinnedNotes = useMemo(() => notes.filter((note) => note.pinned), [notes]);
  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort((left, right) => (right.updatedAt?.getTime() || right.createdAt?.getTime() || 0) - (left.updatedAt?.getTime() || left.createdAt?.getTime() || 0))
        .slice(0, 6),
    [notes]
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
  const hasFilters = Boolean(search.trim()) || Boolean(selectedFolderId);

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
    <PageSection
      title="Capture note"
      description="Write the thought now. Recent notes are next for review."
    >
        <div className="notes-command-strip" aria-label="Notes actions">
          <div className="notes-capture-group">
            <button type="button" className="notes-command-button notes-command-button-primary" onClick={() => void handleCreateNote()}>
              <span aria-hidden="true">+</span>
              Capture note
            </button>
            <span className="notes-library-status">
              {notes.length ? "Review recent below" : "Capture first, sort later"}
            </span>
          </div>
          <div className="notes-secondary-actions">
            <button
              type="button"
              className="notes-command-button"
              onClick={() => {
                setSearchOpen((current) => !current);
                window.setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
              aria-label="Search notes"
            >
              Search
            </button>
            <button
              type="button"
              className={`notes-command-button${toolsOpen ? " active" : ""}`}
              onClick={() => setToolsOpen((current) => !current)}
              aria-expanded={toolsOpen}
              aria-controls="notes-library-tools"
            >
              Edit
            </button>
          </div>
        </div>

        {searchOpen ? (
        <div className="notes-library-toolbar notes-search-toolbar">
          <label className="field-stack notes-search-field">
            <span>Search notes</span>
            <input
              id="notes-search"
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, tags, and notes"
            />
          </label>

          <div className="notes-toolbar-actions">
            {lastOpenNote ? <Link to={`/app/easynotes/${lastOpenNote.id}`} className="primary-button">Resume writing</Link> : null}
          </div>
        </div>
        ) : lastOpenNote ? (
          <Link to={`/app/easynotes/${lastOpenNote.id}`} className="notes-resume-row">
            <span>Resume</span>
            <strong>{lastOpenNote.title.trim() || "Untitled note"}</strong>
          </Link>
        ) : null}

        {!searchOpen ? (
          <div className="notes-library-overview">
            <section className="group-block notes-review-block">
              <div className="group-heading">
                <div>
                  <h3>Review recent</h3>
                  <p className="note-card-meta">
                    <span>Last touched</span>
                    Keep active notes moving
                  </p>
                </div>
                <span>{recentNotes.length}</span>
              </div>
              <div className="notes-library-grid notes-library-grid-recent">
                {recentNotes.map((note) => (
                  <article key={note.id} className="note-card-vnext note-card-selectable note-card-compact">
                    <Link to={`/app/easynotes/${note.id}`} className="note-card-link">
                      <div className="note-card-top">
                        <div>
                          <strong>{note.title.trim() || "Untitled note"}</strong>
                          <p className="note-card-meta">
                            <span>Updated</span>
                            {formatDate(note.updatedAt || note.createdAt)}
                            {renderMemoryCue(note.updatedAt || note.createdAt)}
                          </p>
                        </div>
                        <div className="note-card-badges">
                          {note.folderId && folderNameById.get(note.folderId) ? (
                            <span className="note-folder-badge">{folderNameById.get(note.folderId)}</span>
                          ) : null}
                          {note.pinned ? <span className="note-pin-badge">Pinned</span> : null}
                        </div>
                      </div>
                      <p className="note-card-body">{note.bodyText.trim() || "No content yet."}</p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {pinnedNotes.length ? (
              <section className="group-block">
                <div className="group-heading">
                  <h3>Pinned reference</h3>
                  <span>{pinnedNotes.length}</span>
                </div>
                <div className="notes-library-grid notes-library-grid-featured">
                  {pinnedNotes.slice(0, 4).map((note) => (
                    <article key={note.id} className="note-card-vnext note-card-selectable note-card-featured">
                      <Link to={`/app/easynotes/${note.id}`} className="note-card-link">
                        <div className="note-card-top">
                          <div>
                            <strong>{note.title.trim() || "Untitled note"}</strong>
                            <p>{formatDate(note.updatedAt || note.createdAt)}</p>
                          </div>
                          <div className="note-card-badges">
                            <span className="note-pin-badge">Pinned</span>
                          </div>
                        </div>
                        <p className="note-card-body">{note.bodyText.trim() || "No content yet."}</p>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        <details
          id="notes-library-tools"
          className="advanced-disclosure notes-advanced-tools"
          open={toolsOpen}
          onToggle={(event) => setToolsOpen(event.currentTarget.open)}
        >
          <summary>Organize notes</summary>
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
          <div className="task-composer-actions">
            <button type="button" className="button-secondary compact-button" onClick={() => void handleCreateFolder()}>
              New folder
            </button>
            <button type="button" className="button-secondary compact-button" onClick={() => void handleCleanup()}>
              Clean up empty notes
            </button>
            <Link to="/app/easynotes/trash" className="button-secondary compact-button">
              Recently deleted
            </Link>
          </div>
        </details>

        {error ? <p className="error-copy">{error}</p> : null}
        {cleanupMessage ? <p className="helper-copy">{cleanupMessage}</p> : null}

        <div className="group-heading notes-library-results-heading" aria-label="Notes library results">
          <div>
            <h3>{hasFilters ? "Filtered notes" : "All notes"}</h3>
            {hasFilters ? (
              <div className="note-card-meta">
                <span>Showing</span>
                Matches your current search or folder
              </div>
            ) : null}
          </div>
          <span>{filteredNotes.length}</span>
        </div>

        <div className="notes-library-grid">
          {isLoading ? <p className="helper-copy">Loading your notes...</p> : null}

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="empty-card-vnext notes-empty-card notes-suite-empty-card">
              <span className="notes-empty-suite-label">EasyNotes workspace</span>
              <strong>{hasFilters ? "No notes match this view" : "No notes yet"}</strong>
              <p className="helper-copy">
                {hasFilters
                  ? "Try a different search or folder, or clear filters to return to your full EasyNotes workspace."
                  : "Capture a thought, meeting note, or rough draft here. Your latest notes will be ready to review when you return."}
              </p>
            </div>
          ) : null}

          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className={`note-card-vnext note-card-selectable note-card-compact${selectedNoteIds.includes(note.id) ? " note-card-selected" : ""}${toolsOpen ? " edit-mode" : ""}`}
            >
              {toolsOpen ? (
              <label className="notes-select-row">
                <input
                  type="checkbox"
                  checked={selectedNoteIds.includes(note.id)}
                  onChange={() => toggleSelectedNote(note.id)}
                />
                <span>Select note</span>
              </label>
              ) : null}
              <Link to={`/app/easynotes/${note.id}`} className="note-card-link">
              <div className="note-card-top">
                <div>
                  <strong>{note.title.trim() || "Untitled note"}</strong>
                  <p className="note-card-meta">
                    <span>Updated</span>
                    {formatDate(note.updatedAt || note.createdAt)}
                    {renderMemoryCue(note.updatedAt || note.createdAt)}
                  </p>
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
  );
}
