import type { AssistantConfidence, AssistantIntentType } from "../intentTypes";
import type {
  AssistantPromptId,
  AssistantPromptOutputSchemaName,
} from "../prompts/promptRegistry";

export const assistantModelOutputVersion = "stage-20-output-v1" as const;

export const assistantModelOutputStates = ["draft", "preview", "needs-review"] as const;

export type AssistantModelOutputState = (typeof assistantModelOutputStates)[number];

export const assistantModelDestinationLabels = [
  "Inbox task draft",
  "Notes context draft",
  "Plan preview only",
  "Reminder preview only",
  "Follow-up preview only",
  "Today read",
  "People/place cue",
  "Needs review",
] as const;

export type AssistantModelDestinationLabel = (typeof assistantModelDestinationLabels)[number];

export type AssistantModelOutputSource = {
  sourceId: string;
  sourceLabel: string;
};

export type AssistantModelOutputField = {
  label: string;
  value: string;
  editable: boolean;
};

export type AssistantModelConfirmationRequirement = {
  required: true;
  label: "Final confirmation required" | "Review only" | "Preview only";
  copy: string;
};

export type AssistantModelSuggestionOutput = {
  version: typeof assistantModelOutputVersion;
  promptId: AssistantPromptId;
  outputSchemaName: AssistantPromptOutputSchemaName;
  intent: AssistantIntentType;
  confidence: AssistantConfidence;
  state: AssistantModelOutputState;
  destinationLabel: AssistantModelDestinationLabel;
  title: string;
  summary: string;
  sources: AssistantModelOutputSource[];
  fields: AssistantModelOutputField[];
  confirmation: AssistantModelConfirmationRequirement;
  warnings: string[];
};

export type AssistantModelOutputValidationState = "accepted" | "downgraded" | "rejected";

export type AssistantModelOutputValidation = {
  valid: boolean;
  safetyState: AssistantModelOutputValidationState;
  errors: string[];
  warnings: string[];
  output?: AssistantModelSuggestionOutput;
};
