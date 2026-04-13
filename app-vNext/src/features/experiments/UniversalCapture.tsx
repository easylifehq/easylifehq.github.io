import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createNote, updateNote } from "@/lib/firestore/notes";
import { createTask } from "@/lib/firestore/tasks";
import { auth } from "@/lib/firebase/client";

function detectCaptureType(value: string) {
  const text = value.toLowerCase();
  if (/\b(today|tomorrow|meeting|appointment|calendar|schedule|at \d|pm|am)\b/.test(text)) {
    return "calendar";
  }
  if (/\b(call|email|text|follow up|reply)\b/.test(text)) {
    return "follow-up";
  }
  if (/\b(workout|gym|lift|sets?|reps?|push day|pull day|leg day)\b/.test(text)) {
    return "workout";
  }
  if (/\b(project|milestone|roadmap|launch)\b/.test(text)) {
    return "project";
  }
  if (/\b(note|idea|remember|thought)\b/.test(text)) {
    return "note";
  }
  return "task";
}

export function UniversalCapture() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const suggestion = useMemo(() => detectCaptureType(text), [text]);
  const screenAction = useMemo(() => {
    if (location.pathname.startsWith("/app/easypipeline")) {
      return { label: "Add application", to: "/app/easypipeline/dashboard", hint: "Pipeline" };
    }
    if (location.pathname.startsWith("/app/easyprojects")) {
      return { label: "Open projects", to: "/app/easyprojects", hint: "Projects" };
    }
    if (location.pathname.startsWith("/app/easyworkout")) {
      return { label: "Log workout", to: "/app/easyworkout/log", hint: "Workout" };
    }
    if (location.pathname.startsWith("/app/easynotes")) {
      return { label: "Create note", to: "/app/easynotes", hint: "Notes" };
    }
    if (location.pathname.startsWith("/app/easycalendar")) {
      return { label: "Add event", to: "/app/easycalendar/day", hint: "Calendar" };
    }
    return { label: "Open Add Tasks", to: "/app/easylist/add", hint: "Tasks" };
  }, [location.pathname]);

  async function saveAsTask() {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    await createTask(user.uid, {
      title: text.trim().slice(0, 140),
      notes: text.trim(),
      category: suggestion === "follow-up" ? "Follow-up" : "Inbox",
      estimatedLength: null,
      priorityTier: suggestion === "follow-up" ? 2 : 3,
      priorityLabel: suggestion === "follow-up" ? "High" : "Medium",
      dueDate: null,
      recurring: false,
    });
    setText("");
    setMessage("Captured as an EasyList task.");
  }

  async function saveAsNote() {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const noteId = await createNote(user.uid);
    await updateNote(user.uid, noteId, {
      title: text.trim().split(/\s+/).slice(0, 8).join(" "),
      tags: ["inbox"],
      pinned: false,
      bodyText: text.trim(),
    });
    setText("");
    setMessage("Captured as an EasyNotes inbox note.");
  }

  return (
    <>
      <button type="button" className="capture-fab" onClick={() => setIsOpen(true)}>
        Capture
      </button>

      <div className={`capture-backdrop${isOpen ? " open" : ""}`} onClick={() => setIsOpen(false)} />
      <section className={`capture-modal${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="capture-header">
          <div>
            <p className="eyebrow">{screenAction.hint}</p>
            <h2>Quick add</h2>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>

        <label className="field-stack">
          <span>What is on your mind?</span>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setMessage("");
            }}
            placeholder="Type anything..."
            rows={5}
          />
        </label>

        {text.trim() ? (
          <div className="capture-suggestion">
            This looks like a <strong>{suggestion}</strong>.
          </div>
        ) : null}

        <div className="task-composer-actions">
          <button type="button" className="primary-button" onClick={() => void saveAsTask()} disabled={!text.trim()}>
            Save as task
          </button>
          <button type="button" className="button-secondary" onClick={() => void saveAsNote()} disabled={!text.trim()}>
            Save as note
          </button>
          <Link className="ghost-button" to={screenAction.to} onClick={() => setIsOpen(false)}>
            {screenAction.label}
          </Link>
        </div>
        {message ? <div className="calendar-info-card">{message}</div> : null}
      </section>
    </>
  );
}
