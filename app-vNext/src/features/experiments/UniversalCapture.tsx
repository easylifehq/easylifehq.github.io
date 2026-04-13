import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createApplication, type ApplicationDraft } from "@/lib/firestore/applications";
import { createCalendarEvent } from "@/lib/firestore/calendarEvents";
import { createContact, type ContactDraft } from "@/lib/firestore/contacts";
import { createNote, updateNote } from "@/lib/firestore/notes";
import { createProject, type ProjectDraft } from "@/lib/firestore/projects";
import { createTask } from "@/lib/firestore/tasks";
import { auth } from "@/lib/firebase/client";

type CaptureMode = "task" | "note" | "event" | "application" | "contact" | "project" | "workout";

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
  const [mode, setMode] = useState<CaptureMode>("task");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [secondary, setSecondary] = useState("");
  const [date, setDate] = useState("");
  const suggestion = useMemo(() => detectCaptureType(text), [text]);
  const screenAction = useMemo(() => {
    if (location.pathname.startsWith("/app/easypipeline")) {
      return { mode: "application" as CaptureMode, label: "Add application", to: "/app/easypipeline/dashboard", hint: "Pipeline" };
    }
    if (location.pathname.startsWith("/app/easyprojects")) {
      return { mode: "project" as CaptureMode, label: "Add project", to: "/app/easyprojects", hint: "Projects" };
    }
    if (location.pathname.startsWith("/app/easyworkout")) {
      return { mode: "workout" as CaptureMode, label: "Log workout", to: "/app/easyworkout/log", hint: "Workout" };
    }
    if (location.pathname.startsWith("/app/easynotes")) {
      return { mode: "note" as CaptureMode, label: "Create note", to: "/app/easynotes", hint: "Notes" };
    }
    if (location.pathname.startsWith("/app/easycalendar")) {
      return { mode: "event" as CaptureMode, label: "Add event", to: "/app/easycalendar/day", hint: "Calendar" };
    }
    if (location.pathname.startsWith("/app/easycontacts")) {
      return { mode: "contact" as CaptureMode, label: "Add contact", to: "/app/easycontacts", hint: "Contacts" };
    }
    return { mode: "task" as CaptureMode, label: "Open Add Tasks", to: "/app/easylist/add", hint: "Tasks" };
  }, [location.pathname]);

  function openCapture() {
    setMode(screenAction.mode);
    setMessage("");
    setIsOpen(true);
  }

  function resetFields(nextMessage: string) {
    setText("");
    setSecondary("");
    setDate("");
    setMessage(nextMessage);
  }

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
    resetFields("Saved as a task.");
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
    resetFields("Saved as a note.");
  }

  async function saveContextItem() {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    const title = text.trim();

    if (mode === "task") {
      await saveAsTask();
      return;
    }
    if (mode === "note") {
      await saveAsNote();
      return;
    }
    if (mode === "application") {
      const draft: ApplicationDraft = {
        company: secondary.trim(),
        title,
        status: "need_to_apply",
        priority: "medium",
        offerResponse: "",
        dateApplied: "",
        nextFollowUp: date,
        location: "",
        link: "",
        notes: "",
        contactName: "",
        contactEmail: "",
      };
      await createApplication(user.uid, draft);
      resetFields("Application added.");
      return;
    }
    if (mode === "contact") {
      const draft: ContactDraft = {
        fullName: title,
        relationship: "",
        company: secondary.trim(),
        role: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        source: "",
        status: "warm",
        relatedOpportunityIds: [],
        lastContactedAt: "",
        nextFollowUpAt: date,
        notes: "",
        archived: false,
      };
      await createContact(user.uid, draft);
      resetFields("Contact added.");
      return;
    }
    if (mode === "project") {
      const draft: ProjectDraft = {
        title,
        description: secondary.trim(),
        targetDate: date,
        status: "active",
      };
      await createProject(user.uid, draft);
      resetFields("Project added.");
      return;
    }
    if (mode === "event") {
      const eventDate = date ? new Date(`${date}T09:00:00`) : new Date();
      const endAt = new Date(eventDate);
      endAt.setHours(endAt.getHours() + 1);
      await createCalendarEvent(user.uid, {
        title,
        description: secondary.trim(),
        categoryId: null,
        startAt: eventDate,
        endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType: "other",
      });
      resetFields("Event added.");
    }
  }

  return (
    <>
      <button type="button" className="capture-fab" onClick={openCapture} aria-label="Quick add">
        Add
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

        <div className="capture-mode-row" role="tablist" aria-label="Quick add type">
          {[
            ["task", "Task"],
            ["note", "Note"],
            ["event", "Event"],
            ["application", "Application"],
            ["contact", "Contact"],
            ["project", "Project"],
            ["workout", "Workout"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`capture-mode-button${mode === value ? " active" : ""}`}
              onClick={() => {
                setMode(value as CaptureMode);
                setMessage("");
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="field-stack">
          <span>{mode === "application" ? "Role" : mode === "contact" ? "Name" : mode === "event" ? "Event" : mode === "project" ? "Project" : "What is on your mind?"}</span>
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

        {mode === "application" || mode === "contact" || mode === "project" || mode === "event" ? (
          <div className="capture-detail-grid">
            <label className="field-stack">
              <span>{mode === "application" ? "Company" : mode === "contact" ? "Company" : mode === "project" ? "Notes" : "Details"}</span>
              <input
                value={secondary}
                onChange={(event) => setSecondary(event.target.value)}
                placeholder={mode === "project" ? "Optional project notes" : "Optional"}
              />
            </label>
            <label className="field-stack">
              <span>{mode === "application" || mode === "contact" ? "Follow-up" : mode === "project" ? "Target date" : "Date"}</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>
        ) : null}

        {text.trim() ? (
          <div className="capture-suggestion">
            This looks like a <strong>{suggestion}</strong>.
          </div>
        ) : null}

        <div className="task-composer-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => void saveContextItem()}
            disabled={!text.trim() || mode === "workout"}
          >
            Save {mode}
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
