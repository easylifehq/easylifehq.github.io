export type AssistantCommandIntent = {
  id: "capture" | "plan" | "summarize" | "remember" | "cleanup";
  label: string;
  example: string;
};

export const assistantCommandHints: AssistantCommandIntent[] = [
  {
    id: "capture",
    label: "Capture",
    example: "Drop one loose thought",
  },
  {
    id: "plan",
    label: "Plan",
    example: "Review today's open time",
  },
  {
    id: "summarize",
    label: "Summarize",
    example: "Show the next decision",
  },
  {
    id: "remember",
    label: "Context",
    example: "Keep a note close",
  },
  {
    id: "cleanup",
    label: "Clean up",
    example: "Rescue overdue work",
  },
];

export const assistantCommandHintRow = "Drop one loose thought for review";
