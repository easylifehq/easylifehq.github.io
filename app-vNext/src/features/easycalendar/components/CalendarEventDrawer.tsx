import { useEffect, useState, type FormEvent } from "react";
import type {
  CalendarEventRecord,
  CalendarEventType,
  CalendarItemKind,
} from "@/lib/firestore/calendarEvents";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  combineDateAndTime,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

const EVENT_TYPES: CalendarEventType[] = [
  "class",
  "work",
  "appointment",
  "personal",
  "other",
];
const RECURRENCE_OPTIONS = [
  { value: "", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Daily" },
  { value: "FREQ=WEEKLY", label: "Weekly" },
  { value: "FREQ=MONTHLY", label: "Monthly" },
];

type CalendarEventDrawerProps = {
  event: CalendarEventRecord | null;
  isOpen: boolean;
  onClose: () => void;
};

export function CalendarEventDrawer({
  event,
  isOpen,
  onClose,
}: CalendarEventDrawerProps) {
  const { categories, saveEvent, deleteEvent } = useEasyCalendar();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [itemKind, setItemKind] = useState<CalendarItemKind>("event");
  const [categoryId, setCategoryId] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType>("appointment");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!event) return;

    setTitle(event.title);
    setDescription(event.description);
    setItemKind(event.itemKind);
    setCategoryId(event.categoryId || "");
    setEventType(event.eventType);
    setEventDate(toDateInputValue(event.startAt));
    setStartTime(toTimeInputValue(event.startAt) || "09:00");
    setEndTime(toTimeInputValue(event.endAt) || "10:00");
    setRecurrenceRule(event.recurrenceRule || "");
    setStatusMessage("");
  }, [event]);

  if (!event) return null;
  const currentEvent = event;

  async function handleSave(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    const startAt = combineDateAndTime(eventDate, startTime);
    const endAt = combineDateAndTime(eventDate, endTime);

    if (!title.trim()) {
      setStatusMessage("Add a title before saving.");
      return;
    }

    if (!startAt || (itemKind === "event" && (!endAt || endAt <= startAt))) {
      setStatusMessage("End time must be after the start time.");
      return;
    }

    setIsSaving(true);
    try {
      await saveEvent(currentEvent.id, {
        title: title.trim(),
        description: description.trim(),
        itemKind,
        categoryId: categoryId || null,
        startAt,
        endAt: itemKind === "deadline" ? startAt : endAt,
        allDay: currentEvent.allDay,
        isRecurring: itemKind === "event" && Boolean(recurrenceRule),
        recurrenceRule: itemKind === "event" ? recurrenceRule || null : null,
        eventType,
        linkedTaskId: currentEvent.linkedTaskId,
      });
      setStatusMessage(itemKind === "deadline" ? "Deadline updated." : "Event updated.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await deleteEvent(currentEvent.id);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className={`drawer-backdrop-vnext${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`task-drawer-vnext${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">EasyCalendar</p>
            <h2>Edit calendar item</h2>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={onClose} aria-label="Close event editor">
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSave}>
          <label className="field-stack">
            <span>Title</span>
            <input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
          </label>

          <label className="field-stack">
            <span>Item type</span>
            <select value={itemKind} onChange={(changeEvent) => setItemKind(changeEvent.target.value as CalendarItemKind)}>
              <option value="event">Event - show up at a time</option>
              <option value="deadline">Deadline - due by this time</option>
            </select>
          </label>

          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Date</span>
              <input type="date" value={eventDate} onChange={(changeEvent) => setEventDate(changeEvent.target.value)} />
            </label>

            <label className="field-stack">
              <span>{itemKind === "deadline" ? "Due time" : "Start time"}</span>
              <input type="time" value={startTime} onChange={(changeEvent) => setStartTime(changeEvent.target.value)} />
            </label>

            {itemKind === "event" ? (
            <label className="field-stack">
              <span>End time</span>
              <input type="time" value={endTime} onChange={(changeEvent) => setEndTime(changeEvent.target.value)} />
            </label>
            ) : null}

            <label className="field-stack">
              <span>Type</span>
              <select value={eventType} onChange={(changeEvent) => setEventType(changeEvent.target.value as CalendarEventType)}>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            {itemKind === "event" ? (
            <label className="field-stack">
              <span>Repeat</span>
              <select value={recurrenceRule} onChange={(changeEvent) => setRecurrenceRule(changeEvent.target.value)}>
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            ) : null}

            <label className="field-stack field-stack-wide">
              <span>Category color</span>
              <select value={categoryId} onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}>
                <option value="">Default color</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-stack">
            <span>Notes</span>
            <textarea rows={6} value={description} onChange={(changeEvent) => setDescription(changeEvent.target.value)} />
          </label>

          {statusMessage ? <p className="helper-copy">{statusMessage}</p> : null}

          <div className="drawer-actions-vnext">
            <button type="button" className="danger-button" onClick={() => void handleDelete()} disabled={isSaving}>
              Delete Item
            </button>
            <div className="drawer-actions-right">
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}
