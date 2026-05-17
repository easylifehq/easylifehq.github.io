export type AssistantPreviewKind = "today" | "capture" | "plan" | "context";

export type AssistantPreviewInput = {
  recommendedLabel: string;
  recommendedRoute: string;
};

export type AssistantPreviewAction = {
  kind: AssistantPreviewKind;
  label: string;
  action: string;
  reason: string;
};

export type AssistantContextSummaryInput = {
  overdueCount: number;
  dueTodayCount: number;
  eventCount: number;
  openTimeLabel: string;
  noteTitle?: string;
  contactName?: string;
  contactPlace?: string;
};

const assistantPreviewExamples: Record<AssistantPreviewKind, AssistantPreviewAction> = {
  today: {
    kind: "today",
    label: "Today",
    action: "Choose the first task",
    reason: "Start with the item already asking for attention.",
  },
  capture: {
    kind: "capture",
    label: "Capture",
    action: "Drop this into the inbox",
    reason: "Keep the thought visible before it becomes another tab.",
  },
  plan: {
    kind: "plan",
    label: "Plan",
    action: "Use the next open block",
    reason: "Give the next window one job before adding more.",
  },
  context: {
    kind: "context",
    label: "Saved context",
    action: "Keep the useful detail",
    reason: "Keep the note close for a later follow-up.",
  },
};

export function getLocalAssistantPreview(input: AssistantPreviewInput): AssistantPreviewAction {
  const route = input.recommendedRoute.toLowerCase();
  const label = input.recommendedLabel.toLowerCase();

  if (route.includes("easycalendar") || label.includes("open window") || label.includes("plan")) {
    return assistantPreviewExamples.plan;
  }

  if (route.includes("easynotes") || label.includes("note") || label.includes("remember")) {
    return assistantPreviewExamples.context;
  }

  if (route.includes("easylist/add") || label.includes("capture") || label.includes("inbox")) {
    return assistantPreviewExamples.capture;
  }

  return assistantPreviewExamples.today;
}

export function getLocalAssistantContextRead(input: AssistantContextSummaryInput) {
  const pressure =
    input.overdueCount > 0
      ? `${input.overdueCount} overdue`
      : input.dueTodayCount > 0
        ? `${input.dueTodayCount} due today`
        : input.eventCount > 0
          ? `${input.eventCount} plan item${input.eventCount === 1 ? "" : "s"}`
          : `${input.openTimeLabel} open`;
  const context = input.noteTitle ? `Saved context: ${input.noteTitle}` : "No saved context is leading.";
  const people =
    input.contactName && input.contactPlace
      ? `${input.contactName} may matter near ${input.contactPlace} from saved labels.`
      : "No people/place cue needs attention.";

  return `${pressure}. ${context}. ${people}`;
}
