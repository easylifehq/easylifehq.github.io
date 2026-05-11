export const assistantIntentTypes = [
  "task",
  "note",
  "plan",
  "reminder",
  "follow-up",
  "unsure",
] as const;

export type AssistantIntentType = (typeof assistantIntentTypes)[number];

export type AssistantConfidence = "high" | "medium" | "low";

export type AssistantApprovalState =
  | "suggested"
  | "editing"
  | "approved"
  | "dismissed"
  | "needs-review";

export type AssistantSuggestionField = {
  label: string;
  value: string;
  editable: boolean;
};

export type AssistantIntentSuggestion = {
  id: string;
  sourceText: string;
  intent: AssistantIntentType;
  title: string;
  summary: string;
  confidence: AssistantConfidence;
  confidenceLabel: string;
  approvalState: AssistantApprovalState;
  fields: AssistantSuggestionField[];
  warnings: string[];
};

export const confidenceLanguage: Record<AssistantConfidence, string> = {
  high: "Likely match",
  medium: "Needs a quick check",
  low: "Unsure - review first",
};

export const approvalStateLabels: Record<AssistantApprovalState, string> = {
  suggested: "Awaiting approval",
  editing: "Being edited",
  approved: "Approved locally",
  dismissed: "Dismissed",
  "needs-review": "Needs review",
};
