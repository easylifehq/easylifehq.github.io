import { validateAssistantModelOutput } from "./modelOutputValidator";
import {
  assistantModelOutputVersion,
  type AssistantModelSuggestionOutput,
} from "./modelOutputTypes";

const acceptedTaskDraftOutput: AssistantModelSuggestionOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "task",
  confidence: "medium",
  state: "draft",
  destinationLabel: "Inbox task draft",
  title: "Reply to Maya about Friday plans",
  summary: "Review the typed capture and decide whether to create a task.",
  sources: [
    {
      sourceId: "capture-1",
      sourceLabel: "Typed capture",
    },
  ],
  fields: [
    {
      label: "Task title",
      value: "Reply to Maya about Friday plans",
      editable: true,
    },
  ],
  confirmation: {
    required: true,
    label: "Final confirmation required",
    copy: "Nothing changes until you confirm the task save.",
  },
  warnings: [],
};

const acceptedTodayReadOutput: AssistantModelSuggestionOutput = {
  version: assistantModelOutputVersion,
  promptId: "today-context-read",
  outputSchemaName: "AssistantTodayReadOutputV1",
  intent: "plan",
  confidence: "high",
  state: "preview",
  destinationLabel: "Today read",
  title: "Today has one recovery constraint",
  summary: "Use the selected day summary and saved context before adding more work.",
  sources: [
    {
      sourceId: "day-1",
      sourceLabel: "Selected day summary",
    },
    {
      sourceId: "note-1",
      sourceLabel: "Selected saved context",
    },
  ],
  fields: [
    {
      label: "Next review move",
      value: "Check the overdue item before adding a new block.",
      editable: false,
    },
  ],
  confirmation: {
    required: true,
    label: "Review only",
    copy: "This is a read only. Nothing is saved from Today.",
  },
  warnings: [],
};

const rejectedAutosaveOutput = {
  ...acceptedTaskDraftOutput,
  summary: "I automatically saved this task to your inbox.",
};

const rejectedUnknownIntentOutput = {
  ...acceptedTaskDraftOutput,
  intent: "purchase",
};

const rejectedMissingConfirmationOutput = {
  ...acceptedTaskDraftOutput,
  confirmation: {
    required: false,
    label: "Done",
    copy: "Saved.",
  },
};

const downgradedActionLikeOutput: AssistantModelSuggestionOutput = {
  ...acceptedTaskDraftOutput,
  summary: "This is ready to save as a task after review.",
};

export const modelOutputValidatorProof = [
  {
    name: "accept safe task draft",
    validation: validateAssistantModelOutput(acceptedTaskDraftOutput),
    expectedValid: true,
    expectedState: "accepted",
  },
  {
    name: "accept safe Today read",
    validation: validateAssistantModelOutput(acceptedTodayReadOutput),
    expectedValid: true,
    expectedState: "accepted",
  },
  {
    name: "reject hidden autosave claim",
    validation: validateAssistantModelOutput(rejectedAutosaveOutput),
    expectedValid: false,
    expectedState: "rejected",
  },
  {
    name: "reject unsupported intent",
    validation: validateAssistantModelOutput(rejectedUnknownIntentOutput),
    expectedValid: false,
    expectedState: "rejected",
  },
  {
    name: "reject missing explicit confirmation",
    validation: validateAssistantModelOutput(rejectedMissingConfirmationOutput),
    expectedValid: false,
    expectedState: "rejected",
  },
  {
    name: "downgrade action-like wording",
    validation: validateAssistantModelOutput(downgradedActionLikeOutput),
    expectedValid: true,
    expectedState: "downgraded",
  },
].map((example) => ({
  ...example,
  passed:
    example.validation.valid === example.expectedValid &&
    example.validation.safetyState === example.expectedState,
}));

export const modelOutputValidatorProofPassed = modelOutputValidatorProof.every((example) => example.passed);
