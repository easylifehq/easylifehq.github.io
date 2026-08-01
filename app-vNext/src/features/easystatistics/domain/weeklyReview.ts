import { isValidLocalDateKey, shiftDateKey } from "../../easyworkout/domain/workoutStatistics.ts";

export type WeeklyReviewTask = {
  id: string; title: string; completed: boolean; deletedAt: Date | null; dueDate: Date | null;
  linkedCalendarEventId: string | null; linkedCalendarBlockIds: string[]; createdAt: Date | null; updatedAt: Date | null;
};
export type WeeklyReviewEvent = { id: string; title: string; startAt: Date | null };
export type WeeklyReviewBlock = { id: string; title?: string; startAt: Date | null };
export type WeeklyReviewProject = { id: string; title: string; status: string; targetDate: string };
export type WeeklyReviewLink = { projectId: string; taskId: string };
export type WeeklyReviewApplication = { id: string; company: string; title: string; status: string; nextFollowUp: string };
export type WeeklyReviewWorkout = { id: string; routineName: string; performedOn: string };
export type WeeklyReviewItem = { id: string; title: string; detail: string };
export type WeeklyReviewSectionId = "captures" | "priorities" | "plan" | "projects" | "followups" | "workout";
export type WeeklyReviewSection = {
  id: WeeklyReviewSectionId; eyebrow: string; title: string; summary: string; items: WeeklyReviewItem[];
  actionLabel: string; actionTo: string; needsAction: boolean;
};
export type WeeklyReview = {
  formulaVersion: "easylife-weekly-review-v1"; today: string; reviewThrough: string;
  leadSectionId: WeeklyReviewSectionId; leadTitle: string; leadDetail: string; sections: WeeklyReviewSection[];
};

const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const taskTime = (task: WeeklyReviewTask) => task.createdAt?.getTime() || task.updatedAt?.getTime() || 0;
const plural = (count: number, singular: string, pluralValue = `${singular}s`) => `${count} ${count === 1 ? singular : pluralValue}`;
const needVerb = (count: number) => count === 1 ? "needs" : "need";

export function deriveWeeklyReview(input: {
  nowDateKey: string; tasks: WeeklyReviewTask[]; events: WeeklyReviewEvent[]; taskBlocks: WeeklyReviewBlock[];
  projects: WeeklyReviewProject[]; projectLinks: WeeklyReviewLink[]; applications: WeeklyReviewApplication[]; workouts: WeeklyReviewWorkout[];
}): WeeklyReview {
  const today = isValidLocalDateKey(input.nowDateKey) ? input.nowDateKey : localDateKey(new Date());
  const reviewThrough = shiftDateKey(today, 7);
  const activeTasks = input.tasks.filter((task) => !task.completed && !task.deletedAt);
  const captures = activeTasks
    .filter((task) => !task.dueDate && !task.linkedCalendarEventId && !(task.linkedCalendarBlockIds || []).length)
    .sort((left, right) => taskTime(right) - taskTime(left) || left.title.localeCompare(right.title));
  const priorities = activeTasks
    .filter((task) => task.dueDate && localDateKey(task.dueDate) <= reviewThrough)
    .sort((left, right) => localDateKey(left.dueDate!).localeCompare(localDateKey(right.dueDate!)) || left.title.localeCompare(right.title));
  const upcomingPlan = [
    ...input.events.filter((event) => event.startAt).map((event) => ({ id: `event:${event.id}`, title: event.title || "Untitled event", date: localDateKey(event.startAt!), kind: "Fixed" })),
    ...input.taskBlocks.filter((block) => block.startAt).map((block) => ({ id: `block:${block.id}`, title: block.title || "Planned task block", date: localDateKey(block.startAt!), kind: "Planned" })),
  ].filter((item) => item.date >= today && item.date <= reviewThrough)
    .sort((left, right) => left.date.localeCompare(right.date) || left.title.localeCompare(right.title));
  const activeTaskIds = new Set(activeTasks.map((task) => task.id));
  const projectsMissingNextAction = input.projects.filter((project) => project.status === "active")
    .filter((project) => !input.projectLinks.some((link) => link.projectId === project.id && activeTaskIds.has(link.taskId)))
    .sort((left, right) => (left.targetDate || "9999-12-31").localeCompare(right.targetDate || "9999-12-31") || left.title.localeCompare(right.title));
  const followups = input.applications
    .filter((application) => application.status !== "archived" && isValidLocalDateKey(application.nextFollowUp) && application.nextFollowUp <= reviewThrough)
    .sort((left, right) => left.nextFollowUp.localeCompare(right.nextFollowUp) || left.company.localeCompare(right.company));
  const recentWorkouts = input.workouts
    .filter((workout) => isValidLocalDateKey(workout.performedOn) && workout.performedOn >= shiftDateKey(today, -6) && workout.performedOn <= today)
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn));

  const sections: WeeklyReviewSection[] = [
    { id: "captures", eyebrow: "Capture", title: captures.length ? `${plural(captures.length, "capture")} ${needVerb(captures.length)} a home` : "Inbox is sorted", summary: captures.length ? "Decide what belongs in Today, Plan, a project, or nowhere." : "No unresolved capture is waiting for organization.", items: captures.slice(0, 3).map((task) => ({ id: task.id, title: task.title || "Untitled capture", detail: "No due date or Plan block yet." })), actionLabel: "Review Inbox", actionTo: "/app/easylist/add", needsAction: captures.length > 0 },
    { id: "priorities", eyebrow: "Priorities", title: priorities.length ? `${plural(priorities.length, "priority", "priorities")} ${needVerb(priorities.length)} a decision` : "No due work is pressing", summary: priorities.length ? "Recover overdue work first, then decide what really belongs in the next seven days." : "The next seven days have no dated task pressure.", items: priorities.slice(0, 3).map((task) => { const due = localDateKey(task.dueDate!); return { id: task.id, title: task.title || "Untitled task", detail: due < today ? `Overdue since ${due}` : due === today ? "Due today" : `Due ${due}` }; }), actionLabel: "Open priorities", actionTo: "/app/easylist/dashboard", needsAction: priorities.length > 0 },
    { id: "plan", eyebrow: "Plan", title: upcomingPlan.length ? `${plural(upcomingPlan.length, "commitment")} in view` : "The next seven days are open", summary: upcomingPlan.length ? "Check the shape before adding more. Nothing moves automatically." : "Add only what deserves protected time.", items: upcomingPlan.slice(0, 3).map((item) => ({ id: item.id, title: item.title, detail: `${item.kind} · ${item.date}` })), actionLabel: "Shape the week", actionTo: "/app/easycalendar/month", needsAction: false },
    { id: "projects", eyebrow: "Projects", title: projectsMissingNextAction.length ? `${plural(projectsMissingNextAction.length, "project")} ${needVerb(projectsMissingNextAction.length)} a next action` : "Active projects have a next action", summary: projectsMissingNextAction.length ? "Choose one concrete task instead of expanding the project." : "Every active project is connected to at least one open task.", items: projectsMissingNextAction.slice(0, 3).map((project) => ({ id: project.id, title: project.title || "Untitled project", detail: project.targetDate ? `Target ${project.targetDate}` : "No target date" })), actionLabel: "Review projects", actionTo: "/app/easyprojects", needsAction: projectsMissingNextAction.length > 0 },
    { id: "followups", eyebrow: "Job applications", title: followups.length ? `${plural(followups.length, "follow-up")} due soon` : "No application follow-up is due", summary: followups.length ? "Open the application, decide the message, and send it yourself." : "The next seven days have no dated application follow-up.", items: followups.slice(0, 3).map((application) => ({ id: application.id, title: `${application.company} · ${application.title}`, detail: application.nextFollowUp < today ? `Overdue since ${application.nextFollowUp}` : `Follow up ${application.nextFollowUp}` })), actionLabel: "Open applications", actionTo: "/app/easypipeline/dashboard", needsAction: followups.length > 0 },
    { id: "workout", eyebrow: "Workout", title: recentWorkouts.length ? `${plural(recentWorkouts.length, "session")} in the last 7 days` : "No session in the last 7 days", summary: recentWorkouts.length ? "Use the saved evidence to choose the next routine; recovery is not inferred." : "Start from a saved routine when training fits the week.", items: recentWorkouts.slice(0, 3).map((workout) => ({ id: workout.id, title: workout.routineName || "Workout", detail: workout.performedOn })), actionLabel: "Open Workout", actionTo: "/app/easyworkout/dashboard", needsAction: recentWorkouts.length === 0 },
  ];
  const lead = sections.find((section) => section.needsAction) || sections.find((section) => section.id === "plan")!;
  return { formulaVersion: "easylife-weekly-review-v1", today, reviewThrough, leadSectionId: lead.id, leadTitle: lead.title, leadDetail: lead.summary, sections };
}
