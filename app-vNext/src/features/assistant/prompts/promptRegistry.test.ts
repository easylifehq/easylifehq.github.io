import {
  assistantPromptIds,
  assistantPromptRegistry,
  assistantPromptRegistryValidation,
  validateAssistantPromptRegistryEntry,
  type AssistantPromptRegistryEntry,
} from "./promptRegistry";

const unsafePrompt: AssistantPromptRegistryEntry = {
  id: "intake-suggestion",
  label: "Unsafe prompt",
  purpose: "Tell the model to schedule a reminder and send an email.",
  allowedSourceTypes: ["typed-capture", "current-route"],
  forbiddenInputs: ["none"],
  expectedOutputSchemaName: "AssistantIntakeSuggestionOutputV1",
  requiresSourceAttribution: true,
  requiresApprovalFirstLanguage: true,
  fallbackCopy: "AI is unavailable.",
  promptTemplate: "Schedule this and send the user a confirmation email.",
};

const unsupportedSourcePrompt: AssistantPromptRegistryEntry = {
  id: "today-context-read",
  label: "Unsupported source prompt",
  purpose: "Try to use a raw export.",
  allowedSourceTypes: ["current-route"],
  forbiddenInputs: ["none"],
  expectedOutputSchemaName: "AssistantTodayReadOutputV1",
  requiresSourceAttribution: true,
  requiresApprovalFirstLanguage: true,
  fallbackCopy: "AI is unavailable.",
  promptTemplate: "Use only provided context.",
};

const unsupportedSourcePromptAsUnknown = {
  ...unsupportedSourcePrompt,
  allowedSourceTypes: ["full-app-export"],
};

const missingAttributionPrompt: AssistantPromptRegistryEntry = {
  id: "people-place-cue",
  label: "Missing attribution prompt",
  purpose: "Return a people/place cue.",
  allowedSourceTypes: ["selected-contact-place", "current-route"],
  forbiddenInputs: ["none"],
  expectedOutputSchemaName: "AssistantPeoplePlaceCueOutputV1",
  requiresSourceAttribution: true,
  requiresApprovalFirstLanguage: true,
  fallbackCopy: "AI is unavailable.",
  promptTemplate: "Use only saved place labels from the context packet.",
};

const missingAttributionPromptAsUnknown = {
  ...missingAttributionPrompt,
  requiresSourceAttribution: false,
};

export const promptRegistryProof = [
  {
    name: "valid prompt registry",
    validation: assistantPromptRegistryValidation,
    expectedValid: true,
  },
  {
    name: "reject prompt asking for external actions",
    validation: validateAssistantPromptRegistryEntry(unsafePrompt),
    expectedValid: false,
  },
  {
    name: "reject unsupported source type",
    validation: validateAssistantPromptRegistryEntry(unsupportedSourcePromptAsUnknown),
    expectedValid: false,
  },
  {
    name: "reject missing source attribution requirement",
    validation: validateAssistantPromptRegistryEntry(missingAttributionPromptAsUnknown),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const promptRegistryProofPassed = promptRegistryProof.every((example) => example.passed);

export const promptRegistryPromptIds = assistantPromptRegistry.map((entry) => entry.id);

export const promptRegistryCoversAllPromptIds = assistantPromptIds.every((promptId) =>
  promptRegistryPromptIds.includes(promptId),
);
