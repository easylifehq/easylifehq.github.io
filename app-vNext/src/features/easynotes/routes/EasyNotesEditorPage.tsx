import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function insertLinePrefix(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  stripPrefixes = false
) {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const target = selected || value;
  const transformed = target
    .split("\n")
    .map((line) => {
      const cleaned = stripPrefixes
        ? line.replace(/^\s*(##?\s+|- \[ \]\s+|- )/, "")
        : line;
      return prefix ? `${prefix}${cleaned}` : cleaned;
    })
    .join("\n");

  if (!selected) return transformed;
  return `${before}${transformed}${after}`;
}

export function EasyNotesEditorPage() {
  const navigate = useNavigate();
  const { noteId = "" } = useParams();
  const { notes, isLoading, saveNote, deleteNote, createTaskDraftsFromText } = useEasyNotes();
  const note = useMemo(() => notes.find((entry) => entry.id === noteId) || null, [notes, noteId]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Saved");
  const [taskMessage, setTaskMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const hydratedNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!note) return;

    setTitle(note.title);
    setTags(note.tags.join(", "));
    setBodyText(note.bodyText);
    setPinned(note.pinned);
    setSaveMessage("Saved");
    setTaskMessage("");
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
        tags: parseTags(tags),
        pinned,
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
  }, [title, tags, pinned, bodyText, note, saveNote]);

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

  function applyFormat(type: "heading" | "subheading" | "bullets" | "checklist" | "plain") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const nextValue = insertLinePrefix(
      bodyText,
      textarea.selectionStart,
      textarea.selectionEnd,
      type === "heading"
        ? "# "
        : type === "subheading"
          ? "## "
          : type === "bullets"
            ? "- "
            : type === "checklist"
              ? "- [ ] "
              : "",
      type === "plain"
    );

    setBodyText(nextValue);
    textarea.focus();
  }

  async function handleDelete() {
    if (!note) return;
    setIsDeleting(true);
    await deleteNote(note.id);
    navigate("/app/easynotes");
  }

  async function handleCreateDrafts() {
    if (!note) return;

    const textarea = textareaRef.current;
    const selection =
      textarea && textarea.selectionStart !== textarea.selectionEnd
        ? bodyText.slice(textarea.selectionStart, textarea.selectionEnd)
        : bodyText;

    const count = await createTaskDraftsFromText({
      noteTitle: title.trim(),
      text: selection,
    });

    setTaskMessage(
      count
        ? `${count} draft task${count === 1 ? "" : "s"} sent to EasyList inbox.`
        : "Write or select a few actionable lines first."
    );
  }

  return (
    <section className="notes-editor-shell">
      <div className="notes-editor-topbar">
        <Link to="/app/easynotes" className="button-secondary">
          Back
        </Link>
        <div className="notes-editor-status">
          <span>{saveMessage}</span>
        </div>
      </div>

      <div className="notes-editor-page">
        <div className="notes-format-bar">
          <button type="button" className="button-secondary" onClick={() => applyFormat("heading")}>
            Heading
          </button>
          <button type="button" className="button-secondary" onClick={() => applyFormat("subheading")}>
            Subheading
          </button>
          <button type="button" className="button-secondary" onClick={() => applyFormat("bullets")}>
            Bullets
          </button>
          <button type="button" className="button-secondary" onClick={() => applyFormat("checklist")}>
            Checklist
          </button>
          <button type="button" className="button-secondary" onClick={() => applyFormat("plain")}>
            Plain
          </button>
        </div>

        <label className="notes-title-field">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled note"
          />
        </label>

        <div className="notes-meta-row">
          <label className="field-stack">
            <span>Tags</span>
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="meeting, school, idea"
            />
          </label>

          <label className="notes-pin-toggle">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(event) => setPinned(event.target.checked)}
            />
            <span>Pin note</span>
          </label>
        </div>

        <label className="notes-body-field">
          <textarea
            ref={textareaRef}
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            placeholder="Start writing..."
            rows={20}
          />
        </label>

        <div className="notes-editor-actions">
          <button type="button" className="primary-button" onClick={() => void handleCreateDrafts()}>
            Turn Into Drafts
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Note"}
          </button>
        </div>

        {taskMessage ? <div className="calendar-info-card">{taskMessage}</div> : null}
      </div>
    </section>
  );
}
