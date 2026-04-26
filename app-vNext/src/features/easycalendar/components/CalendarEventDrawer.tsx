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
import {
  CUSTOM_WEEKDAYS_VALUE,
  RECURRENCE_OPTIONS,
  RECURRENCE_WEEKDAYS,
  buildCustomWeekdaysRule,
  getRepeatSelectValue,
  getWeekdayCodeForDateInput,
  getWeekdayCodesFromRule,
} from "@/features/easycalendar/lib/recurrence";

const EVENT_TYPES: CalendarEventType[] = [
  "class",
  "work",
  "appointment",
  "personal",
  "other",
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
  const repeatSelectValue = getRepeatSelectValue(recurrenceRule);
  const selectedRepeatWeekdays = getWeekdayCodesFromRule(recurrenceRule);

  function applyDuration(minutes: number) {
    const startAt = combineDateAndTime(eventDate, startTime);
    if (!startAt) return;
    const nextEnd = new Date(startAt.getTime() + minutes * 60000);
    setEndTime(toTimeInputValue(nextEnd) || endTime);
  }

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

  function handleRepeatChange(nextValue: string) {
    if (nextValue === CUSTOM_WEEKDAYS_VALUE) {
      setRecurrenceRule(buildCustomWeekdaysRule(
        selectedRepeatWeekdays.length
          ? selectedRepeatWeekdays
          : [getWeekdayCodeForDateInput(eventDate)]
      ));
      return;
    }

    setRecurrenceRule(nextValue);
  }

  function toggleRepeatWeekday(code: string) {
    const nextCodes = selectedRepeatWeekdays.includes(code)
      ? selectedRepeatWeekdays.filter((selectedCode) => selectedCode !== code)
      : [...selectedRepeatWeekdays, code];

    setRecurrenceRule(buildCustomWeekdaysRule(nextCodes.length ? nextCodes : [code]));
  }

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
            <p className="helper-copy">{itemKind === "deadline" ? "Quick deadline details." : "Fast event editing."}</p>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={onClose} aria-label="Close event editor">
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSave}>
          <div className="calendar-drawer-summary">
            <span>{itemKind === "deadline" ? "Deadline" : "Event"}</span>
            <span>{eventDate || "No date"}</span>
            <span>{startTime || "No time"}</span>
          </div>

          <label className="field-stack">
            <span>Title</span>
            <input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
          </label>

          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Item type</span>
              <select value={itemKind} onChange={(changeEvent) => setItemKind(changeEvent.target.value as CalendarItemKind)}>
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
              </select>
            </label>

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

            {itemKind === "event" ? (
            <label className="field-stack">
              <span>Event kind</span>
              <select value={eventType} onChange={(changeEvent) => setEventType(changeEvent.target.value as CalendarEventType)}>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            ) : null}

            {itemKind === "event" ? (
            <label className="field-stack">
              <span>Repeat</span>
              <select value={repeatSelectValue} onChange={(changeEvent) => handleRepeatChange(changeEvent.target.value)}>
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            ) : null}

            {itemKind === "event" && repeatSelectValue === CUSTOM_WEEKDAYS_VALUE ? (
              <div className="field-stack field-stack-wide">
                <span>Repeat on</span>
                <div className="calendar-weekday-picker" role="group" aria-label="Repeat weekdays">
                  {RECURRENCE_WEEKDAYS.map((weekday) => (
                    <label key={weekday.code} className="weekday-toggle">
                      <input
                        type="checkbox"
                        checked={selectedRepeatWeekdays.includes(weekday.code)}
                        onChange={() => toggleRepeatWeekday(weekday.code)}
                      />
                      <span>{weekday.label}</span>
                    </label>
                  ))}
                </div>
                <p className="helper-copy">Use this for schedules like Monday, Wednesday, and Friday.</p>
              </div>
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

          {itemKind === "event" ? (
            <div className="calendar-drawer-quick-actions">
              <span className="helper-copy">Quick duration</span>
              <div className="pill-row">
                <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(30)}>30m</button>
                <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(60)}>1h</button>
                <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(90)}>90m</button>
                <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(120)}>2h</button>
              </div>
            </div>
          ) : null}

          <label className="field-stack">
            <span>Notes</span>
            <textarea rows={4} value={description} onChange={(changeEvent) => setDescription(changeEvent.target.value)} />
          </label>

          {statusMessage ? <p className="helper-copy">{statusMessage}</p> : null}

          <div className="drawer-actions-vnext">
            <button type="button" className="danger-button" onClick={() => void handleDelete()} disabled={isSaving}>
              Delete
            </button>
            <div className="drawer-actions-right">
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}
