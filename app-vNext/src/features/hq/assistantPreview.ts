export type AssistantPreviewKind = "today" | "capture" | "plan" | "memory";

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
  memory: {
    kind: "memory",
    label: "Memory",
    action: "Save the useful detail",
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
    return assistantPreviewExamples.memory;
  }

  if (route.includes("easylist/add") || label.includes("capture") || label.includes("inbox")) {
    return assistantPreviewExamples.capture;
  }

  return assistantPreviewExamples.today;
}
