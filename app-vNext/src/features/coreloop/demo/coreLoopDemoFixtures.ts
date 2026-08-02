import type { ApplicationRecord } from "@/lib/firestore/applications";
import type { ContactRecord } from "@/lib/firestore/contacts";
import type { NoteRecord } from "@/lib/firestore/notes";
import type { ProjectRecord } from "@/lib/firestore/projects";
import type { AccountDataCollections } from "../domain/accountExport";
import { weeklyReviewDemoApplications, weeklyReviewDemoNotes, weeklyReviewDemoProjectLinks, weeklyReviewDemoProjects } from "@/features/easystatistics/demo/weeklyReviewDemoFixtures";
import { workoutDemoExercises, workoutDemoRoutines, workoutDemoSessions } from "@/features/easyworkout/demo/workoutDemoFixtures";

export const CORE_LOOP_DEMO_VERSION = "core-loop-wave-3-v1";

export const coreLoopDemoNotes: NoteRecord[] = [
  { id: "visual-note-brief", title: "Sunday reset brief", tags: ["inbox", "planning"], folderId: "", pinned: true, bodyHtml: "", bodyText: "Clear the overdue reply first. Put the project update into a noon block.", createdAt: new Date("2026-08-01T08:40:00Z"), updatedAt: new Date("2026-08-01T09:12:00Z"), deletedAt: null },
  ...weeklyReviewDemoNotes,
];

export const coreLoopDemoContacts: ContactRecord[] = [
  { id: "visual-contact-maya", fullName: "Maya Chen", relationship: "Friend", company: "Northline Studio", role: "Producer", email: "maya@example.com", phone: "", linkedinUrl: "", source: "Friday plans", status: "warm", relatedOpportunityIds: [], lastContactedAt: "2026-07-28", nextFollowUpAt: "2026-08-03", notes: "Reply about Friday plans.", archived: false, createdAt: new Date("2026-07-20T10:00:00Z"), updatedAt: new Date("2026-08-01T09:00:00Z") },
  { id: "visual-contact-jordan", fullName: "Jordan Lee", relationship: "Recruiter", company: "Cedar Labs", role: "Talent partner", email: "jordan@example.com", phone: "", linkedinUrl: "", source: "Pipeline", status: "active", relatedOpportunityIds: ["visual-app-cedar"], lastContactedAt: "2026-08-01", nextFollowUpAt: "2026-08-05", notes: "Send a concise interview follow-up.", archived: false, createdAt: new Date("2026-07-22T14:00:00Z"), updatedAt: new Date("2026-08-01T16:15:00Z") },
];

export const coreLoopDemoProjects: ProjectRecord[] = [
  { id: "visual-project", title: "Weekly planning review", description: "Protect a calm review and planning rhythm.", targetDate: "2026-08-08", status: "active", createdAt: new Date("2026-07-12T09:00:00Z"), updatedAt: new Date("2026-08-01T11:00:00Z") },
  ...weeklyReviewDemoProjects,
];

export const coreLoopDemoApplications: ApplicationRecord[] = [
  { id: "visual-app-cedar", company: "Cedar Labs", title: "Product operations lead", status: "interviewing", priority: "high", offerResponse: "", dateApplied: "2026-07-25", nextFollowUp: "2026-08-01", location: "Remote", link: "", notes: "Prep two workflow examples.", contactName: "Jordan Lee", contactEmail: "jordan@example.com", createdAt: new Date("2026-07-25T11:00:00Z"), updatedAt: new Date("2026-08-01T15:30:00Z") },
  ...weeklyReviewDemoApplications.filter(
    (application) => application.company !== "Cedar Labs" || application.title !== "Product operations lead",
  ),
];

export const coreLoopDemoExportCollections: AccountDataCollections = {
  tasks: [
    { id: "preview-task-1", title: "Send the project update before lunch", notes: "What moved, what is blocked, and what needs a decision.", listName: "Today", category: "Work", priorityTier: 2, dueDate: new Date("2026-08-01T12:00:00Z"), completed: false, linkedCalendarBlockIds: ["preview-block-1"] },
    { id: "preview-task-inbox", title: "Sort weekend captures", notes: "Raw capture", listName: "Inbox", category: "", priorityTier: 5, dueDate: null, completed: false, linkedCalendarBlockIds: [] },
  ],
  notes: coreLoopDemoNotes,
  noteFolders: [{ id: "demo-folder-review", name: "Reviews", createdAt: new Date("2026-07-01T12:00:00Z"), updatedAt: new Date("2026-07-01T12:00:00Z") }],
  calendarEvents: [{ id: "preview-event-1", title: "Project check-in", description: "Weekly status", startAt: new Date("2026-08-03T16:00:00Z"), endAt: new Date("2026-08-03T16:30:00Z"), allDay: false, eventType: "work", linkedTaskId: null }],
  calendarTaskBlocks: [{ id: "preview-block-1", taskId: "preview-task-1", titleSnapshot: "Send the project update before lunch", startAt: new Date("2026-08-01T18:00:00Z"), endAt: new Date("2026-08-01T18:30:00Z"), planningState: "scheduled", completed: false }],
  calendarCategories: [{ id: "demo-category-work", name: "Work", color: "#3157d5" }],
  workoutExercises: workoutDemoExercises,
  workoutRoutines: workoutDemoRoutines,
  workoutSessions: workoutDemoSessions,
  projects: coreLoopDemoProjects,
  projectSections: [{ id: "visual-section-1", projectId: "visual-project", title: "Next actions", order: 1 }],
  projectTaskLinks: weeklyReviewDemoProjectLinks,
  pipelineApplications: coreLoopDemoApplications,
  pipelineDrafts: [{ id: "visual-draft-cedar", subject: "Thanks for the conversation", body: "A user-owned draft.", company: "Cedar Labs", applicationId: "visual-app-cedar", emailType: "follow_up", tone: "warm", createdAt: new Date("2026-08-01T16:00:00Z") }],
  contacts: coreLoopDemoContacts,
};
