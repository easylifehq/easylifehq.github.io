import { useMemo, useState, type FormEvent } from "react";
import type { CalendarEventType } from "@/lib/firestore/calendarEvents";
import type { PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  addMinutes,
  combineDateAndTime,
  startOfDay,
  toDateInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

const EVENT_TYPES: CalendarEventType[] = [
  "class",
  "work",
  "appointment",
  "personal",
  "other",
];

const PLANNING_STATES: PlanningState[] = ["suggested", "scheduled", "accepted"];

export function CalendarComposer() {
  const { categories, tasks, addEvent, scheduleTask } = useEasyCalendar();
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const todayValue = toDateInputValue(startOfDay(new Date()));

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType>("appointment");
  const [eventDate, setEventDate] = useState(todayValue);
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventStatus, setEventStatus] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [taskDate, setTaskDate] = useState(todayValue);
  const [taskStartTime, setTaskStartTime] = useState("14:00");
  const [taskDuration, setTaskDuration] = useState("30");
  const [taskPlanningState, setTaskPlanningState] = useState<PlanningState>("scheduled");
  const [taskStatus, setTaskStatus] = useState("");
  const [isSavingTaskBlock, setIsSavingTaskBlock] = useState(false);

  const selectedTask = activeTasks.find((task) => task.id === selectedTaskId) || null;

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const startAt = combineDateAndTime(eventDate, eventStartTime);
    const endAt = combineDateAndTime(eventDate, eventEndTime);

    if (!eventTitle.trim() || !startAt || !endAt || endAt <= startAt) {
      setEventStatus("Add a title and a real time range.");
      return;
    }

    setIsSavingEvent(true);
    try {
      await addEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        categoryId: eventCategory || null,
        startAt,
        endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType,
      });
      setEventTitle("");
      setEventDescription("");
      setEventCategory("");
      setEventType("appointment");
      setEventStatus("Event added.");
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleTaskBlockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const startAt = combineDateAndTime(taskDate, taskStartTime);
    const durationMinutes = Math.max(5, Number(taskDuration) || selectedTask?.estimatedLength || 30);
    const endAt = addMinutes(startAt, durationMinutes);

    if (!selectedTask || !startAt || !endAt) {
      setTaskStatus("Pick a task, day, and time first.");
      return;
    }

    setIsSavingTaskBlock(true);
    try {
      await scheduleTask(selectedTask, {
        startAt,
        endAt,
        planningState: taskPlanningState,
        userAdjusted: true,
      });
      setTaskStatus("Task block added.");
      setTaskDuration(String(selectedTask.estimatedLength ?? durationMinutes));
    } finally {
      setIsSavingTaskBlock(false);
    }
  }

  return (
    <div className="calendar-composer-grid">
      <form className="calendar-form-card" onSubmit={handleEventSubmit}>
        <div className="panel-header">
          <p className="eyebrow">Fixed event</p>
          <h2>Add an event</h2>
          <p>Classes, work, appointments, and other real commitments belong here.</p>
        </div>

        <div className="task-composer-grid">
          <label className="field-stack field-stack-wide">
            <span>Title</span>
            <input
              type="text"
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              placeholder="Dentist appointment"
            />
          </label>

          <label className="field-stack">
            <span>Type</span>
            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value as CalendarEventType)}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>Category</span>
            <select
              value={eventCategory}
              onChange={(event) => setEventCategory(event.target.value)}
            >
              <option value="">Default color</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>Date</span>
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>Start</span>
            <input
              type="time"
              value={eventStartTime}
              onChange={(event) => setEventStartTime(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>End</span>
            <input
              type="time"
              value={eventEndTime}
              onChange={(event) => setEventEndTime(event.target.value)}
            />
          </label>

          <label className="field-stack field-stack-wide">
            <span>Notes</span>
            <textarea
              rows={4}
              value={eventDescription}
              onChange={(event) => setEventDescription(event.target.value)}
              placeholder="Any details you need later"
            />
          </label>
        </div>

        {eventStatus ? <p className="helper-copy">{eventStatus}</p> : null}
        <button type="submit" className="primary-button" disabled={isSavingEvent}>
          {isSavingEvent ? "Adding..." : "Add Event"}
        </button>
      </form>

      <form className="calendar-form-card" onSubmit={handleTaskBlockSubmit}>
        <div className="panel-header">
          <p className="eyebrow">Linked task block</p>
          <h2>Schedule from EasyList</h2>
          <p>Pick an active task and place it on the calendar as flexible work time.</p>
        </div>

        <div className="task-composer-grid">
          <label className="field-stack field-stack-wide">
            <span>Task</span>
            <select
              value={selectedTaskId}
              onChange={(event) => {
                const nextTaskId = event.target.value;
                setSelectedTaskId(nextTaskId);
                const nextTask = activeTasks.find((task) => task.id === nextTaskId);
                if (nextTask?.estimatedLength) {
                  setTaskDuration(String(nextTask.estimatedLength));
                }
              }}
            >
              <option value="">Choose a task</option>
              {activeTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title || "Untitled task"}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>Date</span>
            <input
              type="date"
              value={taskDate}
              onChange={(event) => setTaskDate(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>Start</span>
            <input
              type="time"
              value={taskStartTime}
              onChange={(event) => setTaskStartTime(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>Duration</span>
            <input
              type="number"
              min="5"
              step="5"
              value={taskDuration}
              onChange={(event) => setTaskDuration(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>State</span>
            <select
              value={taskPlanningState}
              onChange={(event) => setTaskPlanningState(event.target.value as PlanningState)}
            >
              {PLANNING_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedTask ? (
          <p className="helper-copy">
            {selectedTask.category || "No category"}
            {selectedTask.dueDate ? ` | Due ${toDateInputValue(selectedTask.dueDate)}` : ""}
            {selectedTask.linkedCalendarBlockIds.length
              ? ` | Already scheduled ${selectedTask.linkedCalendarBlockIds.length} time(s)`
              : ""}
          </p>
        ) : (
          <p className="helper-copy">
            {activeTasks.length
              ? "Choose an active EasyList task to schedule it."
              : "No open EasyList tasks yet."}
          </p>
        )}

        {taskStatus ? <p className="helper-copy">{taskStatus}</p> : null}
        <button
          type="submit"
          className="primary-button"
          disabled={isSavingTaskBlock || !activeTasks.length}
        >
          {isSavingTaskBlock ? "Adding..." : "Add Task Block"}
        </button>
      </form>
    </div>
  );
}
