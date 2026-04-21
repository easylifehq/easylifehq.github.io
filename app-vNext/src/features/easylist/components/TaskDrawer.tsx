import { useEffect, useState, type FormEvent } from "react";
import type { PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import type { TaskDraft, TaskRecord } from "@/lib/firestore/tasks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { auth } from "@/lib/firebase/client";
import { createApplication } from "@/lib/firestore/applications";
import { subscribeToNotes, type NoteRecord } from "@/lib/firestore/notes";
import { createProject, subscribeToProjects, type ProjectRecord } from "@/lib/firestore/projects";
import { createProjectSection, subscribeToProjectSections, type ProjectSectionRecord } from "@/lib/firestore/projectSections";
import { createProjectTaskLink } from "@/lib/firestore/projectTaskLinks";
import {
  addMinutes,
  combineDateAndTime,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";
import {
  getEmptyTaskDraft,
  getPriorityMeta,
  normalizePriorityTier,
  PRIORITY_TIERS,
  taskToDraft,
} from "@/features/easylist/lib/taskUtils";

type TaskDrawerProps = {
  task: TaskRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, draft: TaskDraft) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onComplete: (taskId: string) => Promise<void>;
  onReopen: (taskId: string) => Promise<void>;
};

type RoutingSuggestion = {
  destination: "project" | "pipeline";
  confidence: "strong" | "light";
  label: string;
  reason: string;
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getRoutingSuggestion(task: TaskRecord): RoutingSuggestion | null {
  const searchableText = [
    task.title,
    task.category,
    task.notes,
  ].join(" ").toLowerCase();

  const pipelineSignals = [
    "application",
    "apply",
    "interview",
    "resume",
    "cover letter",
    "job",
    "career",
    "company",
    "recruiter",
    "follow up",
    "follow-up",
    "offer",
    "linkedin",
  ];
  const projectSignals = [
    "project",
    "build",
    "launch",
    "plan",
    "outline",
    "research",
    "draft",
    "organize",
    "redesign",
    "study plan",
    "multi-step",
    "milestone",
  ];

  const looksPipeline = includesAny(searchableText, pipelineSignals);
  const looksProject =
    includesAny(searchableText, projectSignals) ||
    Boolean(task.estimatedLength && task.estimatedLength >= 90) ||
    task.priorityTier <= 3;

  if (looksPipeline) {
    return {
      destination: "pipeline",
      confidence: includesAny(searchableText, ["interview", "application", "resume", "company", "recruiter"])
        ? "strong"
        : "light",
      label: "Send to EasyPipeline?",
      reason: "This reads like an application, interview, or follow-up item.",
    };
  }

  if (looksProject) {
    return {
      destination: "project",
      confidence: task.priorityTier <= 3 || Boolean(task.estimatedLength && task.estimatedLength >= 120)
        ? "strong"
        : "light",
      label: "Send to EasyProjects?",
      reason: "This looks like it may need steps, context, or a longer work session.",
    };
  }

  return null;
}

export function TaskDrawer({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onComplete,
  onReopen,
}: TaskDrawerProps) {
  const { scheduleTask } = useEasyCalendar();
  const [draft, setDraft] = useState<TaskDraft>(getEmptyTaskDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDuration, setScheduleDuration] = useState("30");
  const [scheduleParts, setScheduleParts] = useState("1");
  const [planningState, setPlanningState] = useState<PlanningState>("scheduled");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [routingMessage, setRoutingMessage] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [sections, setSections] = useState<ProjectSectionRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [targetProjectId, setTargetProjectId] = useState("__new");
  const [targetSectionId, setTargetSectionId] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !isOpen) {
      setProjects([]);
      setSections([]);
      return;
    }

    const unsubscribeProjects = subscribeToProjects(user.uid, setProjects);
    const unsubscribeSections = subscribeToProjectSections(user.uid, setSections);
    const unsubscribeNotes = subscribeToNotes(user.uid, (nextNotes) =>
      setNotes(nextNotes.filter((note) => !note.deletedAt))
    );
    return () => {
      unsubscribeProjects();
      unsubscribeSections();
      unsubscribeNotes();
    };
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setDraft(taskToDraft(task));

      const baseDate = task.dueDate ?? new Date();
      const suggestedTime = new Date(baseDate);
      suggestedTime.setHours(9, 0, 0, 0);

      setScheduleDate(toDateInputValue(baseDate));
      setScheduleTime(toTimeInputValue(suggestedTime));
      setScheduleDuration(String(task.estimatedLength ?? 30));
      setScheduleParts("1");
      setPlanningState(task.linkedCalendarBlockIds.length ? "accepted" : "scheduled");
      setScheduleMessage("");
      setRoutingMessage("");
      setTargetProjectId("__new");
      setTargetSectionId("");
    }
  }, [task]);

  if (!task) return null;
  const currentTask = task;
  const taskId = currentTask.id;
  const routingSuggestion = getRoutingSuggestion(currentTask);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(taskId, {
        ...draft,
        title: draft.title.trim(),
        listName: draft.listName?.trim() || "Main",
        category: draft.category.trim(),
        notes: draft.notes.trim(),
        priorityLabel: getPriorityMeta(draft.priorityTier).label,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSchedule() {
    if (currentTask.completed) return;

    const startAt = combineDateAndTime(scheduleDate, scheduleTime);
    const totalMinutes = Math.max(5, Number(scheduleDuration) || 30);
    const partCount = Math.min(6, Math.max(1, Math.round(Number(scheduleParts) || 1)));
    const minutesPerPart = Math.max(5, Math.ceil(totalMinutes / partCount / 5) * 5);

    if (!startAt) {
      setScheduleMessage("Pick a day and time before sending this to EasyCalendar.");
      return;
    }

    setIsScheduling(true);
    try {
      for (let index = 0; index < partCount; index += 1) {
        const blockStart = addMinutes(startAt, index * minutesPerPart);
        const blockEnd = addMinutes(blockStart, minutesPerPart);
        await scheduleTask(currentTask, {
          startAt: blockStart,
          endAt: blockEnd,
          planningState,
          userAdjusted: true,
        });
      }
      setScheduleMessage(
        partCount === 1
          ? "Sent to EasyCalendar."
          : `Split into ${partCount} calendar blocks.`
      );
    } finally {
      setIsScheduling(false);
    }
  }

  async function handleSendToProject() {
    const user = auth.currentUser;
    if (!user || isRouting) return;

    setIsRouting(true);
    try {
      const projectId =
        targetProjectId === "__new"
          ? await createProject(user.uid, {
              title: currentTask.title || "Untitled project",
              description: [
                "Created from EasyList.",
                currentTask.notes ? `Source task notes: ${currentTask.notes}` : "",
              ].filter(Boolean).join("\n\n"),
              targetDate: currentTask.dueDate ? toDateInputValue(currentTask.dueDate) : "",
              status: "active",
            })
          : targetProjectId;
      const matchingSections = sections.filter((section) => section.projectId === projectId);
      const sectionId =
        targetSectionId && matchingSections.some((section) => section.id === targetSectionId)
          ? targetSectionId
          : await createProjectSection(user.uid, {
              projectId,
              title: "Routed tasks",
              order: matchingSections.length + 1,
            });
      await createProjectTaskLink(user.uid, {
        projectId,
        sectionId,
        taskId: currentTask.id,
        order: matchingSections.length + 1,
        parentLabel: "Routed from EasyList",
      });
      setRoutingMessage(
        targetProjectId === "__new"
          ? "Created an EasyProject and linked the original task."
          : "Linked the original task to the selected EasyProject."
      );
    } finally {
      setIsRouting(false);
    }
  }

  async function handleSendToPipeline() {
    const user = auth.currentUser;
    if (!user || isRouting) return;

    setIsRouting(true);
    try {
      await createApplication(user.uid, {
        company: currentTask.category || "Pipeline item",
        title: currentTask.title || "Untitled follow-up",
        status: "follow_up",
        priority: currentTask.priorityTier <= 4 ? "high" : currentTask.priorityTier >= 8 ? "low" : "medium",
        offerResponse: "",
        dateApplied: "",
        nextFollowUp: currentTask.dueDate ? toDateInputValue(currentTask.dueDate) : "",
        location: "",
        link: "",
        notes: [
          "Created from EasyList task.",
          currentTask.notes,
          `Source task id: ${currentTask.id}`,
        ].filter(Boolean).join("\n\n"),
        contactName: "",
        contactEmail: "",
      });
      setRoutingMessage("Sent to EasyPipeline as a follow-up item.");
    } finally {
      setIsRouting(false);
    }
  }

  return (
    <>
      <div className={`drawer-backdrop-vnext${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`task-drawer-vnext${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">Task details</p>
            <h2>Edit task</h2>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={onClose} aria-label="Close task details">
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSave}>
          <label className="field-stack">
            <span>Kind</span>
            <select
              value={draft.itemKind || "task"}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  itemKind: event.target.value === "deadline" ? "deadline" : "task",
                }))
              }
            >
              <option value="task">Task - something to work on</option>
              <option value="deadline">Deadline - something due</option>
            </select>
          </label>

          <label className="field-stack">
            <span>Title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>{draft.itemKind === "deadline" ? "Due by" : "Due date"}</span>
            <input
              type="date"
              value={draft.dueDate ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value || null }))}
            />
          </label>

          <label className="field-stack">
            <span>List</span>
            <input
              type="text"
              value={draft.listName || "Main"}
              onChange={(event) => setDraft((current) => ({ ...current, listName: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>Category</span>
            <input
              type="text"
              value={draft.category}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>Duration (minutes)</span>
            <input
              type="number"
              min="0"
              step="5"
              value={draft.estimatedLength ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  estimatedLength: event.target.value ? Number(event.target.value) : null,
                }))
              }
            />
          </label>

          <label className="field-stack">
            <span>Priority</span>
            <select
              value={draft.priorityTier}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priorityTier: normalizePriorityTier(event.target.value),
                }))
              }
            >
              {PRIORITY_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}. {getPriorityMeta(tier).label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>Notes</span>
            <textarea
              rows={6}
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>Linked EasyNote</span>
            <select
              value={draft.linkedNoteId || ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  linkedNoteId: event.target.value || null,
                }))
              }
            >
              <option value="">No linked note</option>
              {notes.slice(0, 80).map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title || note.bodyText.slice(0, 48) || "Untitled note"}
                </option>
              ))}
            </select>
          </label>

          <div className="drawer-actions-vnext">
            <button
              type="button"
              className="danger-button"
              onClick={() => void onDelete(taskId).then(onClose)}
            >
              Delete
            </button>

            <div className="drawer-actions-right">
              {currentTask.completed ? (
                <button type="button" className="ghost-button" onClick={() => void onReopen(taskId).then(onClose)}>
                  Reopen
                </button>
              ) : (
                <button type="button" className="ghost-button" onClick={() => void onComplete(taskId).then(onClose)}>
                  Mark Complete
                </button>
              )}

              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        <section className="drawer-link-card">
          <div className="panel-header">
            <p className="eyebrow">EasyCalendar</p>
            <h2>Send this task to your calendar</h2>
            <p>
              Choose when you want to work on it. This creates a flexible linked
              task block in EasyCalendar.
            </p>
          </div>

          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Day</span>
              <input
                type="date"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </label>

            <label className="field-stack">
              <span>Start time</span>
              <input
                type="time"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
              />
            </label>

            <label className="field-stack">
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="5"
                step="5"
                value={scheduleDuration}
                onChange={(event) => setScheduleDuration(event.target.value)}
              />
            </label>

            <label className="field-stack">
              <span>Split into blocks</span>
              <select
                value={scheduleParts}
                onChange={(event) => setScheduleParts(event.target.value)}
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
                value={planningState}
                onChange={(event) => setPlanningState(event.target.value as PlanningState)}
              >
                <option value="suggested">Suggested</option>
                <option value="scheduled">Scheduled</option>
                <option value="accepted">Accepted</option>
              </select>
            </label>
          </div>

          <div className="drawer-link-footer">
            <p className="helper-copy">
              {currentTask.linkedCalendarBlockIds.length
                ? `Already linked ${currentTask.linkedCalendarBlockIds.length} time(s).`
                : "Not on the calendar yet."}
              {Number(scheduleParts) > 1
                ? ` This will create ${scheduleParts} equal work blocks starting at ${scheduleTime}.`
                : ""}
            </p>
            {scheduleMessage ? <p className="helper-copy">{scheduleMessage}</p> : null}
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleSchedule()}
              disabled={isScheduling || currentTask.completed}
            >
              {isScheduling ? "Sending..." : "Send to EasyCalendar"}
            </button>
          </div>
        </section>

        <section className="drawer-link-card">
          <div className="panel-header">
            <p className="eyebrow">Routing</p>
            <h2>Send this task into a bigger workflow</h2>
            <p>
              Keep the source task intact while creating the project or pipeline
              context around it.
            </p>
          </div>

          {routingSuggestion ? (
            <div className={`routing-suggestion ${routingSuggestion.destination}`}>
              <div>
                <span>{routingSuggestion.confidence === "strong" ? "Strong suggestion" : "Light suggestion"}</span>
                <h3>{routingSuggestion.label}</h3>
                <p>{routingSuggestion.reason}</p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void (routingSuggestion.destination === "project"
                    ? handleSendToProject()
                    : handleSendToPipeline())
                }
                disabled={isRouting}
              >
                {isRouting
                  ? "Sending..."
                  : routingSuggestion.destination === "project"
                    ? "Send to EasyProjects"
                    : "Send to EasyPipeline"}
              </button>
            </div>
          ) : (
            <div className="routing-suggestion calm">
              <div>
                <span>No loud signal</span>
                <h3>Keep it in EasyList for now.</h3>
                <p>You can still route it manually if this turns into something bigger.</p>
              </div>
            </div>
          )}

          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Project</span>
              <select
                value={targetProjectId}
                onChange={(event) => {
                  setTargetProjectId(event.target.value);
                  setTargetSectionId("");
                }}
              >
                <option value="__new">Create a new project from this task</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title || "Untitled project"}
                  </option>
                ))}
              </select>
            </label>

            {targetProjectId !== "__new" ? (
              <label className="field-stack">
                <span>Section</span>
                <select
                  value={targetSectionId}
                  onChange={(event) => setTargetSectionId(event.target.value)}
                >
                  <option value="">Create a Routed tasks section</option>
                  {sections
                    .filter((section) => section.projectId === targetProjectId)
                    .map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title || "Untitled section"}
                      </option>
                    ))}
                </select>
              </label>
            ) : null}
          </div>

          <div className="drawer-actions-vnext">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void handleSendToProject()}
              disabled={isRouting}
            >
              Send to EasyProjects
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void handleSendToPipeline()}
              disabled={isRouting}
            >
              Send to EasyPipeline
            </button>
          </div>
          {routingMessage ? <p className="helper-copy">{routingMessage}</p> : null}
        </section>
      </aside>
    </>
  );
}
