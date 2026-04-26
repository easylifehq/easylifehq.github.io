import { useMemo, useState, type FormEvent } from "react";
import type { CalendarEventType, CalendarItemKind } from "@/lib/firestore/calendarEvents";
import type { PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import {
  addMinutes,
  combineDateAndTime,
  startOfDay,
  toDateInputValue,
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

const PLANNING_STATES: PlanningState[] = ["suggested", "scheduled", "accepted"];

export function CalendarComposer() {
  const { categories, tasks, addEvent, addTask, scheduleTask } = useEasyCalendar();
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const todayValue = toDateInputValue(startOfDay(new Date()));

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventItemKind, setEventItemKind] = useState<CalendarItemKind>("event");
  const [eventCategory, setEventCategory] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType>("appointment");
  const [eventDate, setEventDate] = useState(todayValue);
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventRecurrenceRule, setEventRecurrenceRule] = useState("");
  const [createPrepTask, setCreatePrepTask] = useState(false);
  const [prepTaskTitle, setPrepTaskTitle] = useState("");
  const [prepTaskMinutes, setPrepTaskMinutes] = useState("60");
  const [eventStatus, setEventStatus] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [taskDate, setTaskDate] = useState(todayValue);
  const [taskStartTime, setTaskStartTime] = useState("14:00");
  const [taskDuration, setTaskDuration] = useState("30");
  const [taskSplitCount, setTaskSplitCount] = useState("1");
  const [taskPlanningState, setTaskPlanningState] = useState<PlanningState>("scheduled");
  const [taskStatus, setTaskStatus] = useState("");
  const [isSavingTaskBlock, setIsSavingTaskBlock] = useState(false);

  const selectedTask = activeTasks.find((task) => task.id === selectedTaskId) || null;
  const repeatSelectValue = getRepeatSelectValue(eventRecurrenceRule);
  const selectedRepeatWeekdays = getWeekdayCodesFromRule(eventRecurrenceRule);

  function handleRepeatChange(nextValue: string) {
    if (nextValue === CUSTOM_WEEKDAYS_VALUE) {
      setEventRecurrenceRule(buildCustomWeekdaysRule(
        selectedRepeatWeekdays.length
          ? selectedRepeatWeekdays
          : [getWeekdayCodeForDateInput(eventDate)]
      ));
      return;
    }

    setEventRecurrenceRule(nextValue);
  }

  function toggleRepeatWeekday(code: string) {
    const nextCodes = selectedRepeatWeekdays.includes(code)
      ? selectedRepeatWeekdays.filter((selectedCode) => selectedCode !== code)
      : [...selectedRepeatWeekdays, code];

    setEventRecurrenceRule(buildCustomWeekdaysRule(nextCodes.length ? nextCodes : [code]));
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const startAt = combineDateAndTime(eventDate, eventStartTime);
    const endAt = combineDateAndTime(eventDate, eventEndTime);

    if (!eventTitle.trim()) {
      setEventStatus("Add a title before saving this event.");
      return;
    }

    if (!startAt || (eventItemKind === "event" && (!endAt || endAt <= startAt))) {
      setEventStatus("End time must be after the start time.");
      return;
    }

    setIsSavingEvent(true);
    try {
      const eventId = await addEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        itemKind: eventItemKind,
        categoryId: eventCategory || null,
        startAt,
        endAt: eventItemKind === "deadline" ? startAt : endAt,
        allDay: false,
        isRecurring: eventItemKind === "event" && Boolean(eventRecurrenceRule),
        recurrenceRule: eventItemKind === "event" ? eventRecurrenceRule || null : null,
        eventType,
      });

      if (createPrepTask && eventId) {
        await addTask({
          itemKind: eventItemKind === "deadline" ? "deadline" : "task",
          title: prepTaskTitle.trim() || `Prepare for ${eventTitle.trim()}`,
          category: eventCategory || eventType,
          dueDate: toDateInputValue(startAt),
          estimatedLength: Math.max(5, Number(prepTaskMinutes) || 60),
          priorityTier: 4,
          priorityLabel: getPriorityMeta(4).label,
          notes: `Linked to calendar ${eventItemKind}: ${eventTitle.trim()}`,
          linkedCalendarEventId: eventId,
          linkedNoteId: null,
          recurring: false,
        });
      }
      setEventTitle("");
      setEventDescription("");
      setEventItemKind("event");
      setEventCategory("");
      setEventType("appointment");
      setEventRecurrenceRule("");
      setCreatePrepTask(false);
      setPrepTaskTitle("");
      setPrepTaskMinutes("60");
      setEventStatus(createPrepTask ? "Calendar item and linked task added." : "Calendar item added.");
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleTaskBlockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const startAt = combineDateAndTime(taskDate, taskStartTime);
    const totalMinutes = Math.max(5, Number(taskDuration) || selectedTask?.estimatedLength || 30);
    const splitCount = Math.min(6, Math.max(1, Math.round(Number(taskSplitCount) || 1)));
    const minutesPerBlock = Math.max(5, Math.ceil(totalMinutes / splitCount / 5) * 5);

    if (!selectedTask || !startAt) {
      setTaskStatus("Pick a task, day, and time first.");
      return;
    }

    setIsSavingTaskBlock(true);
    try {
      for (let index = 0; index < splitCount; index += 1) {
        const blockStart = addMinutes(startAt, index * minutesPerBlock);
        const blockEnd = addMinutes(blockStart, minutesPerBlock);
        await scheduleTask(selectedTask, {
          startAt: blockStart,
          endAt: blockEnd,
          planningState: taskPlanningState,
          userAdjusted: true,
        });
      }
      setTaskStatus(splitCount === 1 ? "Task block added." : `Task split into ${splitCount} blocks.`);
      setTaskDuration(String(selectedTask.estimatedLength ?? totalMinutes));
    } finally {
      setIsSavingTaskBlock(false);
    }
  }

  return (
    <div className="calendar-composer-grid">
      <form className="calendar-form-card" onSubmit={handleEventSubmit}>
        <div className="panel-header">
          <p className="eyebrow">Fixed event</p>
          <h2>Add calendar item</h2>
          <p>Use Event for things you attend. Use Deadline for things that are due at a specific time.</p>
        </div>

        <div className="calendar-item-section">
          <strong>Item details</strong>
          <p className="helper-copy">Choose whether this is scheduled time or a due marker before filling in the matching fields.</p>
        </div>

        <div className="task-composer-grid calendar-event-details-grid">
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
            <span>Item type</span>
            <select
              value={eventItemKind}
              onChange={(event) => setEventItemKind(event.target.value as CalendarItemKind)}
            >
              <option value="event">Event - show up at a time</option>
              <option value="deadline">Deadline - due by this time</option>
            </select>
          </label>

          <label className="field-stack">
            <span>Color label</span>
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
        </div>

        <div className="calendar-item-section">
          <strong>{eventItemKind === "deadline" ? "Deadline timing" : "Event timing"}</strong>
          <p className="helper-copy">
            {eventItemKind === "deadline"
              ? "Deadlines use one due time and do not repeat."
              : "Events use start and end times, with repeat options for classes and routines."}
          </p>
        </div>

        <div className="task-composer-grid calendar-event-timing-grid">
          <label className="field-stack">
            <span>Date</span>
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>{eventItemKind === "deadline" ? "Due time" : "Start"}</span>
            <input
              type="time"
              value={eventStartTime}
              onChange={(event) => setEventStartTime(event.target.value)}
            />
          </label>

          {eventItemKind === "event" ? (
            <>
              <label className="field-stack">
                <span>End</span>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(event) => setEventEndTime(event.target.value)}
                />
              </label>

              <label className="field-stack">
                <span>Event kind</span>
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
            </>
          ) : null}

          {eventItemKind === "event" ? (
            <label className="field-stack">
              <span>Repeat</span>
              <select
                value={repeatSelectValue}
                onChange={(event) => handleRepeatChange(event.target.value)}
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {eventItemKind === "event" && repeatSelectValue === CUSTOM_WEEKDAYS_VALUE ? (
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
        </div>

        <div className="calendar-item-section">
          <strong>{eventItemKind === "deadline" ? "EasyList deadline" : "Prep task"}</strong>
          <p className="helper-copy">
            {eventItemKind === "deadline"
              ? "Optionally mirror this due marker as an EasyList deadline."
              : "Optionally create one linked task for preparation or follow-up."}
          </p>
        </div>

        <div className="task-composer-grid">
          <label className="inline-check field-stack-wide">
            <input
              type="checkbox"
              checked={createPrepTask}
              onChange={(event) => setCreatePrepTask(event.target.checked)}
            />
            <span>
              Also create a linked EasyList {eventItemKind === "deadline" ? "deadline" : "task"} for this.
            </span>
          </label>

          {createPrepTask ? (
            <>
              <label className="field-stack field-stack-wide">
                <span>Linked task title</span>
                <input
                  type="text"
                  value={prepTaskTitle}
                  onChange={(event) => setPrepTaskTitle(event.target.value)}
                  placeholder={`Prepare for ${eventTitle || "this item"}`}
                />
              </label>

              <label className="field-stack">
                <span>Estimated task minutes</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={prepTaskMinutes}
                  onChange={(event) => setPrepTaskMinutes(event.target.value)}
                />
              </label>
            </>
          ) : null}

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
          {isSavingEvent ? "Adding..." : "Add Calendar Item"}
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
            <span>Duration (minutes)</span>
            <input
              type="number"
              min="5"
              step="5"
              value={taskDuration}
              onChange={(event) => setTaskDuration(event.target.value)}
            />
          </label>

          <label className="field-stack">
            <span>Split into blocks</span>
            <select
              value={taskSplitCount}
              onChange={(event) => setTaskSplitCount(event.target.value)}
            >
              <option value="1">1 block</option>
              <option value="2">2 blocks</option>
              <option value="3">3 blocks</option>
              <option value="4">4 blocks</option>
              <option value="5">5 blocks</option>
              <option value="6">6 blocks</option>
            </select>
          </label>

          <label className="field-stack">
            <span>Calendar status</span>
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
            {Number(taskSplitCount) > 1
              ? ` | Creates ${taskSplitCount} equal blocks starting at ${taskStartTime}`
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
