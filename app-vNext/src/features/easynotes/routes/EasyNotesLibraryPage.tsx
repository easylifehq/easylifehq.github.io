import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { classifyAssistantIntent } from "@/features/assistant/intentClassifier";
import {
  buildNoteHandoffPreview,
  buildLocalDraftFromSuggestion,
  contextDraftActionOptions,
} from "@/features/assistant/localDraftBuilder";
import {
  localDraftStatusLabels,
  localDraftTypeLabels,
  type AssistantContextDraftAction,
  type AssistantNoteHandoffPreview,
  type AssistantNoteSaveConfirmation,
} from "@/features/assistant/localDraftTypes";
import type { NoteDraft } from "@/lib/firestore/notes";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

const lastOpenNoteStorageKey = "easynotes:lastOpenNoteId";
const TASK_CUE_PATTERN = /\b(task|todo|to do|need to|should|follow up|reply|call|text|send|finish|submit)\b/i;
const PLAN_CUE_PATTERN = /\b(plan|schedule|calendar|today|tomorrow|this week|deadline|due|block|morning|afternoon)\b/i;

function formatDate(value: Date | null) {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getContextCue(value: Date | null) {
  if (!value) return "Recent";

  const ageInDays = Math.floor((Date.now() - value.getTime()) / 86400000);

  if (ageInDays <= 2) return "Recent";
  if (ageInDays >= 14) return "Review soon";

  return "";
}

function renderContextCue(value: Date | null) {
  const cue = getContextCue(value);

  return cue ? <em className="note-context-cue">{cue}</em> : null;
}

function getNoteCueReason(note: { title: string; bodyText: string; tags: string[]; pinned: boolean }) {
  const searchable = `${note.title} ${note.bodyText} ${note.tags.join(" ")}`;

  if (note.pinned) return "Pinned context for review.";
  if (PLAN_CUE_PATTERN.test(searchable)) return "Mentions time, deadlines, or blocks.";
  if (TASK_CUE_PATTERN.test(searchable)) return "Looks like action hiding in text.";

  return "Recent saved context.";
}

export function EasyNotesLibraryPage() {
  const navigate = useNavigate();
  const {
    notes,
    folders,
    addNote,
    createNoteFromDraft,
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
  const [contextDraftAction, setContextDraftAction] = useState<AssistantContextDraftAction>("keep-context");
  const [showNoteHandoff, setShowNoteHandoff] = useState(false);
  const [noteHandoffPreview, setNoteHandoffPreview] = useState<AssistantNoteHandoffPreview | null>(null);
  const [noteSaveConfirmation, setNoteSaveConfirmation] = useState<AssistantNoteSaveConfirmation | null>(null);
  const [isCreatingBlankNote, setIsCreatingBlankNote] = useState(false);
  const [lastOpenNoteId] = useState(() => window.localStorage.getItem(lastOpenNoteStorageKey) || "");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const folderNameById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder.name])),
    [folders]
  );
  const pinnedNotes = useMemo(() => notes.filter((note) => note.pinned), [notes]);
  const staleNotes = useMemo(
    () =>
      notes.filter((note) => {
        const touchedAt = note.updatedAt || note.createdAt;
        if (!touchedAt) return false;

        return Date.now() - touchedAt.getTime() >= 14 * 86400000;
      }),
    [notes]
  );
  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort((left, right) => (right.updatedAt?.getTime() || right.createdAt?.getTime() || 0) - (left.updatedAt?.getTime() || left.createdAt?.getTime() || 0))
        .slice(0, 6),
    [notes]
  );
  const recallNoteForToday = useMemo(
    () =>
      pinnedNotes[0] ||
      recentNotes.find((note) => PLAN_CUE_PATTERN.test(`${note.title} ${note.bodyText} ${note.tags.join(" ")}`)) ||
      recentNotes.find((note) => TASK_CUE_PATTERN.test(`${note.title} ${note.bodyText} ${note.tags.join(" ")}`)) ||
      recentNotes[0] ||
      null,
    [pinnedNotes, recentNotes]
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
  const contextDraftSource =
    lastOpenNote?.bodyText.trim() || lastOpenNote?.title.trim() || "Keep the launch notes close and pin the next decision.";
  const contextDraftSuggestion = useMemo(
    () => classifyAssistantIntent(`Keep this context for review: ${contextDraftSource}`),
    [contextDraftSource]
  );
  const selectedContextDraftOption =
    contextDraftActionOptions.find((option) => option.action === contextDraftAction) || contextDraftActionOptions[0];
  const selectedContextDraft = selectedContextDraftOption?.draftType
    ? buildLocalDraftFromSuggestion(contextDraftSuggestion, selectedContextDraftOption.draftType)
    : null;
  const canPreviewNoteHandoff = selectedContextDraft?.draftType === "note";
  const isDemoReviewMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("demo") === "1" || params.get("visualQa") === "1";
  }, []);
  const contextBridge = useMemo(
    () => [
      {
        label: "Saved context",
        count: notes.length,
        detail: "Manual context for Today review.",
      },
      {
        label: "Task cue",
        count: notes.filter((note) => TASK_CUE_PATTERN.test(`${note.title} ${note.bodyText} ${note.tags.join(" ")}`)).length,
        detail: "Looks like action hiding in text.",
      },
      {
        label: "Plan cue",
        count: notes.filter((note) => PLAN_CUE_PATTERN.test(`${note.title} ${note.bodyText} ${note.tags.join(" ")}`)).length,
        detail: "Mentions time, deadlines, or blocks.",
      },
      {
        label: "Pin context",
        count: pinnedNotes.length,
        detail: "Already kept close for reference.",
      },
      {
        label: "Review old context",
        count: staleNotes.length,
        detail: "Untouched for two weeks or more.",
      },
    ],
    [notes, pinnedNotes.length, staleNotes.length]
  );

  async function handleCreateNote() {
    if (isCreatingBlankNote) return;
    setIsCreatingBlankNote(true);
    try {
      const noteId = await addNote();
      if (noteId) {
        navigate(`/app/easynotes/${noteId}`);
      }
    } finally {
      setIsCreatingBlankNote(false);
    }
  }

  function clearNoteSaveConfirmation() {
    setNoteSaveConfirmation(null);
  }

  function buildNoteDraftFromHandoff(preview: AssistantNoteHandoffPreview): NoteDraft | null {
    const title = preview.title.trim();
    const bodyText = preview.body.trim();
    const contextGroup = preview.contextGroup.trim();

    if (!title && !bodyText) return null;

    return {
      title: title || "Assistant context note",
      bodyText,
      tags: contextGroup ? [contextGroup] : [],
      folderId: "",
      pinned: preview.pinPreview,
    };
  }

  async function handleConfirmNoteSave() {
    if (!noteHandoffPreview || noteSaveConfirmation?.status === "saving") return;

    const noteDraft = buildNoteDraftFromHandoff(noteHandoffPreview);
    if (!noteDraft) {
      setNoteSaveConfirmation({
        sourcePreviewId: noteHandoffPreview.id,
        title: noteHandoffPreview.title,
        contextGroup: noteHandoffPreview.contextGroup,
        pinPreview: noteHandoffPreview.pinPreview,
        savedNoteId: null,
        status: "blocked",
        receiptLabel: "Save blocked",
        message: "Name the note or add body text before saving. Nothing was saved.",
      });
      return;
    }

    setNoteSaveConfirmation({
      sourcePreviewId: noteHandoffPreview.id,
      title: noteDraft.title,
      contextGroup: noteHandoffPreview.contextGroup.trim() || "No context group",
      pinPreview: noteDraft.pinned,
      savedNoteId: null,
      status: "saving",
      receiptLabel: "Saving one note",
      message: "Saving this note only...",
    });

    if (isDemoReviewMode) {
      setNoteSaveConfirmation({
        sourcePreviewId: noteHandoffPreview.id,
        title: noteDraft.title,
        contextGroup: noteHandoffPreview.contextGroup.trim() || "No context group",
        pinPreview: noteDraft.pinned,
        savedNoteId: null,
        status: "blocked",
        receiptLabel: "Demo receipt preview",
        message:
          "Demo review mode: no signed-in note save happened. This final confirmation would save one note only outside demo review; nothing else was created.",
      });
      return;
    }

    const noteId = await createNoteFromDraft(noteDraft);

    setNoteSaveConfirmation({
      sourcePreviewId: noteHandoffPreview.id,
      title: noteDraft.title,
      contextGroup: noteHandoffPreview.contextGroup.trim() || "No context group",
      pinPreview: noteDraft.pinned,
      savedNoteId: noteId,
      status: noteId ? "saved" : "blocked",
      receiptLabel: noteId ? "Saved note receipt" : "Save blocked",
      message: noteId
        ? "Saved one note only. No task, plan, reminder, follow-up, email, calendar item, notification, sync, or model call was created."
        : "No signed-in note save happened in this preview session. Nothing else was created.",
    });
  }

  async function handleCreateFolder() {
    const folderName = window.prompt("Context group name");
    if (!folderName?.trim()) return;

    const folderId = await addFolder(folderName);
    if (folderId) {
      setSelectedFolderId(folderId);
    }
  }

  async function handleRenameFolder() {
    if (!selectedFolderId) return;
    const currentFolder = folders.find((folder) => folder.id === selectedFolderId);
    const folderName = window.prompt("Context group name", currentFolder?.name || "");
    if (!folderName?.trim()) return;

    await renameFolder(selectedFolderId, folderName);
  }

  async function handleDeleteFolder() {
    if (!selectedFolderId) return;
    const currentFolder = folders.find((folder) => folder.id === selectedFolderId);
    const confirmed = window.confirm(
      `Delete ${currentFolder?.name || "this group"}? Notes inside it will move to No group.`
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
        ? `${count} empty context note${count === 1 ? "" : "s"} moved to Recently deleted.`
        : "No empty context notes to clean up."
    );
  }

  return (
    <PageSection
      title="Notes"
      description="Write something down or open an existing note."
    >
        <div className="notes-command-strip" aria-label="Notes actions">
          <div className="notes-capture-group">
            <button
              type="button"
              className="notes-command-button notes-command-button-primary"
              onClick={() => void handleCreateNote()}
              disabled={isCreatingBlankNote}
            >
              <span aria-hidden="true">+</span>
              {isCreatingBlankNote ? "Opening..." : "New note"}
            </button>
            <span className="notes-library-status">
              {notes.length ? "Open a note below" : "Start writing"}
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
              Organize
            </button>
          </div>
        </div>

        <section className="notes-context-recall-hint" aria-label="Notes recovery and export boundary">
          <div>
            <span>Recovery and export</span>
            <strong>Local draft backup, manual export</strong>
            <p>
              Notes editor recovery uses this browser while autosave catches up. Export remains a manual Settings
              download, and notes are not sent, synced, or exported automatically.
            </p>
          </div>
          <Link to="/app/settings/data" className="button-secondary compact-button">
            Data export
          </Link>
        </section>

        {lastOpenNote ? (
          <Link to={`/app/easynotes/${lastOpenNote.id}`} className="notes-resume-row notes-resume-row-primary">
            <span>Last note</span>
            <strong>{lastOpenNote.title.trim() || "Untitled note"}</strong>
          </Link>
        ) : null}

        <div className="notes-library-overview notes-library-overview-first">
          <section className="group-block notes-review-block notes-review-block-simple">
            <div className="group-heading">
              <div>
                <h3>Recent notes</h3>
                <p className="note-card-meta">
                  <span>Tap to edit</span>
                  No extra workflow
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
                        </p>
                      </div>
                    </div>
                    <p className="note-card-body">{note.bodyText.trim() || "No content yet."}</p>
                  </Link>
                </article>
              ))}
              {!isLoading && !recentNotes.length ? (
                <div className="empty-card-vnext notes-empty-card notes-suite-empty-card">
                  <strong>No notes yet</strong>
                  <p className="helper-copy">Use New note. You can sort it later.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <details className="advanced-disclosure notes-advanced-tools notes-assistant-tools">
          <summary>More note tools</summary>
        <div className="settings-status-grid" aria-label="Assistant context bridge">
          {contextBridge.map((item) => (
            <article className="settings-status-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <section className="notes-context-recall-hint" aria-label="Saved context useful for Today">
          <div>
            <span>Useful for Today</span>
            <strong>{recallNoteForToday ? recallNoteForToday.title.trim() || "Untitled note" : "No saved context yet"}</strong>
            <p>
              {recallNoteForToday
                ? `${getNoteCueReason(recallNoteForToday)} Open it when reviewing Today or drafting Inbox items; nothing is recalled automatically.`
                : "Keep one note here and it can become a manual context cue when you review Today."}
            </p>
          </div>
          {recallNoteForToday ? (
            <Link to={`/app/easynotes/${recallNoteForToday.id}`} className="button-secondary compact-button">
              Open context
            </Link>
          ) : (
            <button type="button" className="button-secondary compact-button" onClick={() => void handleCreateNote()}>
              Keep context
            </button>
          )}
        </section>

        <section className="notes-context-draft-affordance" aria-labelledby="notes-context-draft-title">
          <div className="notes-context-draft-copy">
            <span>{localDraftStatusLabels["unsaved-preview"]}</span>
            <h3 id="notes-context-draft-title">Note/context assistant draft</h3>
            <p>
              Preview a normal note save. Nothing else changes.
            </p>
          </div>
          <div className="notes-context-draft-actions" aria-label="Local context draft actions">
            {contextDraftActionOptions.map((option) => (
              <button
                key={option.action}
                type="button"
                className={contextDraftAction === option.action ? "active" : ""}
                onClick={() => {
                  setContextDraftAction(option.action);
                  setShowNoteHandoff(false);
                  setNoteHandoffPreview(null);
                  clearNoteSaveConfirmation();
                }}
                title="Local preview only."
              >
                <strong>{option.label}</strong>
                <small>{option.summary}</small>
              </button>
            ))}
          </div>
          {selectedContextDraft ? (
            <article className="notes-context-draft-preview" aria-label="Unsaved context draft preview">
              <div>
                <span>{localDraftTypeLabels[selectedContextDraft.draftType]}</span>
                <strong>{selectedContextDraft.title}</strong>
                <p>{selectedContextDraft.body}</p>
              </div>
              {selectedContextDraft.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
              {canPreviewNoteHandoff ? (
                <div className="assistant-handoff-actions notes-handoff-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      const preview = buildNoteHandoffPreview(selectedContextDraft);
                      setNoteHandoffPreview(preview);
                      setShowNoteHandoff(Boolean(preview));
                      clearNoteSaveConfirmation();
                    }}
                  >
                    Preview note save path
                  </button>
                  <span>This prepares an editable local note. Final confirmation still decides whether it saves.</span>
                </div>
              ) : null}
            </article>
          ) : (
            <p className="notes-context-draft-dismissed">
              Dismissed locally. No note/context draft was saved, pinned, created, scheduled, or synced.
            </p>
          )}
          {showNoteHandoff && noteHandoffPreview ? (
            <article className="notes-note-handoff-preview" aria-label="Editable unsaved note draft preview">
              <div className="assistant-local-draft-header">
                <span>Note/context save preview</span>
                <strong>Editable unsaved note draft</strong>
              </div>
              <div className="notes-note-handoff-grid">
                <label className="field-stack">
                  <span>Note title</span>
                  <input
                    type="text"
                    value={noteHandoffPreview.title}
                    onChange={(event) =>
                      setNoteHandoffPreview((current) => {
                        clearNoteSaveConfirmation();
                        return current ? { ...current, title: event.target.value } : current;
                      })
                    }
                  />
                </label>
                <label className="field-stack">
                  <span>Context group</span>
                  <input
                    type="text"
                    value={noteHandoffPreview.contextGroup}
                    onChange={(event) =>
                      setNoteHandoffPreview((current) => {
                        clearNoteSaveConfirmation();
                        return current ? { ...current, contextGroup: event.target.value } : current;
                      })
                    }
                  />
                </label>
                <label className="inline-check notes-note-handoff-pin">
                  <input
                    type="checkbox"
                    checked={noteHandoffPreview.pinPreview}
                    onChange={(event) =>
                      setNoteHandoffPreview((current) => {
                        clearNoteSaveConfirmation();
                        return current ? { ...current, pinPreview: event.target.checked } : current;
                      })
                    }
                  />
                  <span>Preview as pinned inside the note only</span>
                </label>
                <label className="field-stack notes-note-handoff-body">
                  <span>Note body</span>
                  <textarea
                    rows={4}
                    value={noteHandoffPreview.body}
                    onChange={(event) =>
                      setNoteHandoffPreview((current) => {
                        clearNoteSaveConfirmation();
                        return current ? { ...current, body: event.target.value } : current;
                      })
                    }
                  />
                </label>
              </div>
              {noteHandoffPreview.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
              <div className="notes-note-save-confirmation" aria-label="Final note save confirmation">
                <div>
                  <span>Final confirmation</span>
                  <strong>Save one note</strong>
                  <p>
                    Note/context save only: `{noteHandoffPreview.title || "Assistant context note"}` can be saved as
                    one note. Everything else stays preview-only.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-button compact-button"
                  onClick={() => void handleConfirmNoteSave()}
                  disabled={noteSaveConfirmation?.status === "saving"}
                >
                  {noteSaveConfirmation?.status === "saving" ? "Saving note..." : "Confirm and save note"}
                </button>
              </div>
              {noteSaveConfirmation ? (
                <div
                  className={`notes-note-save-receipt notes-note-save-receipt-${noteSaveConfirmation.status}`}
                  aria-label="Note save receipt"
                >
                  <div className="notes-note-save-receipt-header">
                    <span>{noteSaveConfirmation.receiptLabel}</span>
                    <strong>{noteSaveConfirmation.title || "Assistant context note"}</strong>
                  </div>
                  <dl className="notes-note-save-receipt-details">
                    <div>
                      <dt>Context group</dt>
                      <dd>{noteSaveConfirmation.contextGroup || "No context group"}</dd>
                    </div>
                    <div>
                      <dt>Note pin</dt>
                      <dd>{noteSaveConfirmation.pinPreview ? "Pinned inside the saved note only" : "Not pinned"}</dd>
                    </div>
                    <div className="notes-note-save-receipt-scope">
                      <dt>Only saved</dt>
                      <dd>Note/context</dd>
                    </div>
                  </dl>
                  <p>{noteSaveConfirmation.message}</p>
                  <p>
                    No task, plan, reminder, follow-up, email, notification, calendar item, sync, model call, or real
                    model-backed recall was created.
                  </p>
                </div>
              ) : null}
            </article>
          ) : null}
        </section>
        </details>

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
              placeholder="Search saved context"
            />
          </label>

          <div className="notes-toolbar-actions">
            {lastOpenNote ? <Link to={`/app/easynotes/${lastOpenNote.id}`} className="primary-button">Resume writing</Link> : null}
          </div>
        </div>
        ) : null}

        {false && lastOpenNote ? (
          <Link to={`/app/easynotes/${lastOpenNote.id}`} className="notes-resume-row">
            <span>Resume</span>
            <strong>{lastOpenNote.title.trim() || "Untitled note"}</strong>
          </Link>
        ) : null}

        {false && !searchOpen ? (
          <div className="notes-library-overview">
            <section className="group-block notes-review-block">
              <div className="group-heading">
                <div>
                  <h3>Review context</h3>
                  <p className="note-card-meta">
                    <span>Last touched</span>
                    Keep active context moving
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
                            {renderContextCue(note.updatedAt || note.createdAt)}
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
          <summary>Organize context</summary>
          <div className="notes-control-center">
          <label className="field-stack">
            <span>Context group</span>
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
                <option value="">No group</option>
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
                    Rename group
                  </button>
                  <button type="button" className="ghost-button compact-button" onClick={() => void handleDeleteFolder()}>
                    Delete group
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
              New group
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

        <div className="group-heading notes-library-results-heading" aria-label="Notes results">
          <div>
            <h3>{hasFilters ? "Filtered notes" : "All notes"}</h3>
            {hasFilters ? (
              <div className="note-card-meta">
                <span>Showing</span>
                Matches your current search or context group
              </div>
            ) : null}
          </div>
          <span>{filteredNotes.length}</span>
        </div>

        <div className="notes-library-grid">
          {isLoading ? <p className="helper-copy">Loading notes...</p> : null}

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="empty-card-vnext notes-empty-card notes-suite-empty-card">
              <strong>{hasFilters ? "No notes match this view" : "No saved context yet"}</strong>
              <p className="helper-copy">
                {hasFilters
                  ? "Try a different search or context group, or clear filters to return to the thoughts kept for later."
                  : "Keep a thought, meeting note, or rough draft here. It will be ready when Today needs more context."}
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
                    {renderContextCue(note.updatedAt || note.createdAt)}
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
