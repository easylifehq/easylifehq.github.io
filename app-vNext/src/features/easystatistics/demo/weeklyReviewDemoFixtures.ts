import type { ApplicationRecord } from "../../../lib/firestore/applications";
import type { NoteRecord } from "../../../lib/firestore/notes";
import type { ProjectRecord } from "../../../lib/firestore/projects";
import type { ProjectTaskLinkRecord } from "../../../lib/firestore/projectTaskLinks";

export const WEEKLY_REVIEW_DEMO_VERSION = "weekly-review-v1";

export const weeklyReviewDemoApplications: ApplicationRecord[] = [
  { id: "demo-application-cedar", company: "Cedar Labs", title: "Product operations lead", status: "interviewing", priority: "high", offerResponse: "", dateApplied: "2026-07-21", nextFollowUp: "2026-08-01", location: "Remote", link: "", notes: "Send the promised workflow example.", contactName: "Jordan Lee", contactEmail: "jordan@example.com", createdAt: new Date("2026-07-21T11:00:00"), updatedAt: new Date("2026-07-31T15:30:00") },
  { id: "demo-application-harbor", company: "Harbor Tools", title: "Customer systems designer", status: "follow_up", priority: "medium", offerResponse: "", dateApplied: "2026-07-24", nextFollowUp: "2026-08-05", location: "Denver, CO", link: "", notes: "Follow up with one portfolio link.", contactName: "Priya Shah", contactEmail: "priya@example.com", createdAt: new Date("2026-07-24T13:20:00"), updatedAt: new Date("2026-07-31T09:10:00") },
];

export const weeklyReviewDemoProjects: ProjectRecord[] = [
  { id: "demo-project-weekly-reset", title: "Simplify the weekly reset", description: "Turn scattered review surfaces into one calm decision path.", targetDate: "2026-08-07", status: "active", createdAt: new Date("2026-07-20T09:00:00"), updatedAt: new Date("2026-07-31T11:00:00") },
  { id: "demo-project-assistant-notes", title: "Consolidate assistant notes", description: "Already connected to an open task.", targetDate: "2026-08-10", status: "active", createdAt: new Date("2026-07-22T09:00:00"), updatedAt: new Date("2026-07-30T11:00:00") },
];

export const weeklyReviewDemoProjectLinks: ProjectTaskLinkRecord[] = [
  { id: "demo-weekly-link", projectId: "demo-project-assistant-notes", sectionId: "", taskId: "preview-task-3", order: 1, parentLabel: "Next", createdAt: new Date("2026-07-30T10:00:00"), updatedAt: new Date("2026-07-30T10:00:00") },
];

export const weeklyReviewDemoNotes: NoteRecord[] = [
  { id: "demo-weekly-note", title: "Weekly reset notes", bodyText: "Keep the review calm: recover, decide, then plan.", bodyHtml: "<p>Keep the review calm: recover, decide, then plan.</p>", tags: ["weekly", "review"], folderId: "", pinned: true, deletedAt: null, createdAt: new Date("2026-07-30T08:00:00"), updatedAt: new Date("2026-07-31T08:00:00") },
];
