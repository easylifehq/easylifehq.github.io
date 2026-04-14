import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  createApplication,
  type ApplicationDraft,
  type ApplicationPriority,
} from "@/lib/firestore/applications";
import { createCalendarEvent, type CalendarEventType } from "@/lib/firestore/calendarEvents";
import { createContact, type ContactDraft } from "@/lib/firestore/contacts";
import { createNote, updateNote } from "@/lib/firestore/notes";
import { createProject, type ProjectDraft, type ProjectStatus } from "@/lib/firestore/projects";
import { createTask } from "@/lib/firestore/tasks";
import { auth } from "@/lib/firebase/client";

type CaptureMode = "task" | "note" | "event" | "application" | "contact" | "project" | "workout";

type QuickAddDetails = {
  company: string;
  role: string;
  email: string;
  followUp: string;
  taskCategory: string;
  taskDueDate: string;
  taskMinutes: string;
  taskPriority: 1 | 2 | 3 | 4 | 5;
  priority: ApplicationPriority;
  projectStatus: ProjectStatus;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
};

const defaultDetails: QuickAddDetails = {
  company: "",
  role: "",
  email: "",
  followUp: "",
  taskCategory: "",
  taskDueDate: "",
  taskMinutes: "",
  taskPriority: 3,
  priority: "medium",
  projectStatus: "active",
  notes: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  eventType: "other",
};

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

function priorityLabel(priority: 1 | 2 | 3 | 4 | 5) {
  return {
    1: "Urgent",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Someday",
  }[priority];
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseEventDetails(value: string) {
  const text = value.toLowerCase();
  const updates: Partial<Pick<QuickAddDetails, "date" | "startTime" | "endTime" | "eventType">> = {};
  const date = new Date();

  if (/\btomorrow\b/.test(text)) {
    date.setDate(date.getDate() + 1);
    updates.date = formatDateInput(date);
  } else if (/\btoday\b/.test(text)) {
    updates.date = formatDateInput(date);
  }

  const timeMatch = text.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] ?? "0");
    const meridiem = timeMatch[3];

    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    if (!meridiem && hour >= 1 && hour <= 7) hour += 12;

    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    updates.startTime = formatTimeInput(start);
    updates.endTime = formatTimeInput(end);
  }

  if (/\b(dentist|doctor|appointment)\b/.test(text)) {
    updates.eventType = "appointment";
  } else if (/\b(class|lecture|lab)\b/.test(text)) {
    updates.eventType = "class";
  } else if (/\b(work|shift|meeting)\b/.test(text)) {
    updates.eventType = "work";
  }

  return updates;
}

export function UniversalCapture() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("task");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<QuickAddDetails>(defaultDetails);
  const [openTarget, setOpenTarget] = useState<{ to: string; label: string } | null>(null);
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
    setOpenTarget(null);
    setIsOpen(true);
  }

  function resetFields(nextMessage: string, options: { keepOpenTarget?: boolean } = {}) {
    setText("");
    setDetails(defaultDetails);
    setMessage(nextMessage);
    if (!options.keepOpenTarget) {
      setOpenTarget(null);
    }
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCapture();
      }
      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "+") {
        event.preventDefault();
        openCapture();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [screenAction.mode]);

  async function saveAsTask(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    const minutes = Number(details.taskMinutes);
    const inferredPriority = suggestion === "follow-up" ? 2 : 3;
    const priorityTier = details.taskPriority || inferredPriority;

    await createTask(user.uid, {
      title: text.trim().slice(0, 140),
      notes: text.trim(),
      category: details.taskCategory.trim() || (suggestion === "follow-up" ? "Follow-up" : "Inbox"),
      estimatedLength: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
      priorityTier,
      priorityLabel: priorityLabel(priorityTier),
      dueDate: details.taskDueDate || null,
      recurring: false,
    });
    if (!options.addAnother) {
      setOpenTarget({ to: `/app/easylist/dashboard`, label: "Open task list" });
    }
    resetFields(options.addAnother ? "Task saved. Add the next one." : "Saved as a task.", { keepOpenTarget: !options.addAnother });
  }

  async function saveAsNote(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const noteId = await createNote(user.uid);
    await updateNote(user.uid, noteId, {
      title: text.trim().split(/\s+/).slice(0, 8).join(" "),
      tags: ["inbox"],
      pinned: false,
      bodyText: text.trim(),
    });
    if (!options.addAnother) {
      setOpenTarget({ to: `/app/easynotes/${noteId}`, label: "Open note" });
    }
    resetFields(options.addAnother ? "Note saved. Add the next one." : "Saved as a note.", { keepOpenTarget: !options.addAnother });
  }

  async function saveContextItem(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    const title = text.trim();

    if (mode === "task") {
      await saveAsTask(options);
      return;
    }
    if (mode === "note") {
      await saveAsNote(options);
      return;
    }
    if (mode === "application") {
      const draft: ApplicationDraft = {
        company: details.company.trim(),
        title,
        status: "need_to_apply",
        priority: details.priority,
        offerResponse: "",
        dateApplied: "",
        nextFollowUp: details.followUp,
        location: "",
        link: "",
        notes: details.notes.trim(),
        contactName: "",
        contactEmail: "",
      };
      const applicationId = await createApplication(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easypipeline/dashboard?application=${applicationId}`, label: "Open board" });
      }
      resetFields(options.addAnother ? "Application added. Add the next one." : "Application added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "contact") {
      const draft: ContactDraft = {
        fullName: title,
        relationship: "",
        company: details.company.trim(),
        role: details.role.trim(),
        email: details.email.trim(),
        phone: "",
        linkedinUrl: "",
        source: "",
        status: "warm",
        relatedOpportunityIds: [],
        lastContactedAt: "",
        nextFollowUpAt: details.followUp,
        notes: details.notes.trim(),
        archived: false,
      };
      const contactId = await createContact(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easycontacts?contact=${contactId}`, label: "Open contacts" });
      }
      resetFields(options.addAnother ? "Contact added. Add the next one." : "Contact added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "project") {
      const draft: ProjectDraft = {
        title,
        description: details.notes.trim(),
        targetDate: details.date,
        status: details.projectStatus,
      };
      const projectId = await createProject(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easyprojects/${projectId}`, label: "Open project" });
      }
      resetFields(options.addAnother ? "Project added. Add the next one." : "Project added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "event") {
      const dateValue = details.date || new Date().toISOString().split("T")[0];
      const eventDate = new Date(`${dateValue}T${details.startTime || "09:00"}:00`);
      const endAt = new Date(`${dateValue}T${details.endTime || "10:00"}:00`);
      if (endAt <= eventDate) {
        endAt.setHours(eventDate.getHours() + 1);
      }
      await createCalendarEvent(user.uid, {
        title,
        description: details.notes.trim(),
        categoryId: null,
        startAt: eventDate,
        endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType: details.eventType,
      });
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easycalendar/day`, label: "Open calendar" });
      }
      resetFields(options.addAnother ? "Event added. Add the next one." : "Event added.", { keepOpenTarget: !options.addAnother });
    }
  }

  return (
    <>
      <button type="button" className="capture-fab" onClick={openCapture} aria-label="Quick add">
        Add
      </button>

      <div className={`capture-backdrop${isOpen ? " open" : ""}`} onClick={() => setIsOpen(false)} />
      <section
        className={`capture-modal${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            void saveContextItem();
          }
        }}
      >
        <div className="capture-header">
          <div>
            <p className="eyebrow">{screenAction.hint}</p>
            <h2>Quick add</h2>
          </div>
          <div className="capture-header-actions">
            <span className="command-hint">Ctrl K</span>
            <button type="button" className="ghost-button compact-button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
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
              const nextValue = event.target.value;
              setText(nextValue);
              if (mode === "event") {
                const parsedDetails = parseEventDetails(nextValue);
                if (Object.keys(parsedDetails).length) {
                  setDetails((current) => ({ ...current, ...parsedDetails }));
                }
              }
              setMessage("");
            }}
            placeholder="Type anything..."
            rows={5}
          />
        </label>

        {mode === "task" ? (
          <div className="capture-detail-grid capture-detail-grid-four">
            <label className="field-stack">
              <span>Category</span>
              <input
                value={details.taskCategory}
                onChange={(event) => setDetails((current) => ({ ...current, taskCategory: event.target.value }))}
                placeholder="Inbox"
              />
            </label>
            <label className="field-stack">
              <span>Due</span>
              <input type="date" value={details.taskDueDate} onChange={(event) => setDetails((current) => ({ ...current, taskDueDate: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Minutes</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={details.taskMinutes}
                onChange={(event) => setDetails((current) => ({ ...current, taskMinutes: event.target.value }))}
                placeholder="15"
              />
            </label>
            <label className="field-stack">
              <span>Priority</span>
              <select
                value={details.taskPriority}
                onChange={(event) => setDetails((current) => ({ ...current, taskPriority: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 }))}
              >
                <option value={1}>Urgent</option>
                <option value={2}>High</option>
                <option value={3}>Medium</option>
                <option value={4}>Low</option>
                <option value={5}>Someday</option>
              </select>
            </label>
          </div>
        ) : null}

        {mode === "application" ? (
          <div className="capture-detail-grid capture-detail-grid-three">
            <label className="field-stack">
              <span>Company</span>
              <input
                value={details.company}
                onChange={(event) => setDetails((current) => ({ ...current, company: event.target.value }))}
                placeholder="Company"
              />
            </label>
            <label className="field-stack">
              <span>Follow-up</span>
              <input type="date" value={details.followUp} onChange={(event) => setDetails((current) => ({ ...current, followUp: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Priority</span>
              <select value={details.priority} onChange={(event) => setDetails((current) => ({ ...current, priority: event.target.value as ApplicationPriority }))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        ) : null}

        {mode === "contact" ? (
          <div className="capture-detail-grid capture-detail-grid-three">
            <label className="field-stack">
              <span>Company</span>
              <input value={details.company} onChange={(event) => setDetails((current) => ({ ...current, company: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Role</span>
              <input value={details.role} onChange={(event) => setDetails((current) => ({ ...current, role: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Email</span>
              <input type="email" value={details.email} onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Follow-up</span>
              <input type="date" value={details.followUp} onChange={(event) => setDetails((current) => ({ ...current, followUp: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "project" ? (
          <div className="capture-detail-grid">
            <label className="field-stack">
              <span>Target date</span>
              <input type="date" value={details.date} onChange={(event) => setDetails((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Status</span>
              <select value={details.projectStatus} onChange={(event) => setDetails((current) => ({ ...current, projectStatus: event.target.value as ProjectStatus }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="field-stack field-stack-wide">
              <span>Notes</span>
              <textarea rows={3} value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "event" ? (
          <div className="capture-detail-grid capture-detail-grid-four">
            <label className="field-stack">
              <span>Date</span>
              <input type="date" value={details.date} onChange={(event) => setDetails((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Start</span>
              <input type="time" value={details.startTime} onChange={(event) => setDetails((current) => ({ ...current, startTime: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>End</span>
              <input type="time" value={details.endTime} onChange={(event) => setDetails((current) => ({ ...current, endTime: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Type</span>
              <select value={details.eventType} onChange={(event) => setDetails((current) => ({ ...current, eventType: event.target.value as CalendarEventType }))}>
                <option value="class">Class</option>
                <option value="work">Work</option>
                <option value="appointment">Appointment</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field-stack field-stack-wide">
              <span>Details</span>
              <textarea rows={3} value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {text.trim() ? (
          <div className="capture-suggestion">
            This looks like a <strong>{suggestion}</strong>.
          </div>
        ) : null}

        <div className="task-composer-actions">
          {mode === "workout" ? (
            <Link className="primary-button" to="/app/easyworkout/log" onClick={() => setIsOpen(false)}>
              Open logger
            </Link>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={() => void saveContextItem()}
              disabled={!text.trim()}
            >
              Save {mode}
            </button>
          )}
          {mode !== "workout" ? (
            <button type="button" className="button-secondary" onClick={() => void saveContextItem({ addAnother: true })} disabled={!text.trim()}>
              Save and add another
            </button>
          ) : null}
          <button type="button" className="button-secondary" onClick={() => void saveAsNote()} disabled={!text.trim()}>
            Save as note
          </button>
          <Link className="ghost-button" to={screenAction.to} onClick={() => setIsOpen(false)}>
            {screenAction.label}
          </Link>
        </div>
        {message ? (
          <div className="calendar-info-card capture-success-card">
            <span>{message}</span>
            {openTarget ? (
              <Link className="button-secondary compact-button" to={openTarget.to} onClick={() => setIsOpen(false)}>
                {openTarget.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
