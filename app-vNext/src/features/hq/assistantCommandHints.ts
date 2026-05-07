export type AssistantCommandIntent = {
  id: "capture" | "plan" | "summarize" | "remember" | "cleanup";
  label: string;
  example: string;
};

export const assistantCommandHints: AssistantCommandIntent[] = [
  {
    id: "capture",
    label: "Capture",
    example: "Add a task for the bill tomorrow",
  },
  {
    id: "plan",
    label: "Plan",
    example: "Block 30 minutes for the proposal",
  },
  {
    id: "summarize",
    label: "Summarize",
    example: "Show the three things that need a decision",
  },
  {
    id: "remember",
    label: "Remember",
    example: "Keep the dentist note close",
  },
  {
    id: "cleanup",
    label: "Clean up",
    example: "Find overdue tasks I can reschedule",
  },
];

export const assistantCommandHintRow = assistantCommandHints
  .map((hint) => hint.example)
  .join(" / ");
