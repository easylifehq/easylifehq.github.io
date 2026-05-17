import {
  allowedAssistantContextSourceTypes,
  type AssistantContextSourceType,
} from "../modelContracts/contextPacket";

export const assistantPromptRegistryVersion = "stage-20-prompts-v1" as const;

export const assistantPromptIds = [
  "intake-suggestion",
  "today-context-read",
  "plan-capacity-read",
  "note-context-draft",
  "people-place-cue",
] as const;

export type AssistantPromptId = (typeof assistantPromptIds)[number];

export const assistantPromptOutputSchemaNames = [
  "AssistantIntakeSuggestionOutputV1",
  "AssistantTodayReadOutputV1",
  "AssistantPlanCapacityOutputV1",
  "AssistantNoteContextDraftOutputV1",
  "AssistantPeoplePlaceCueOutputV1",
] as const;

export type AssistantPromptOutputSchemaName = (typeof assistantPromptOutputSchemaNames)[number];

export type AssistantPromptRegistryEntry = {
  id: AssistantPromptId;
  label: string;
  purpose: string;
  allowedSourceTypes: AssistantContextSourceType[];
  forbiddenInputs: string[];
  expectedOutputSchemaName: AssistantPromptOutputSchemaName;
  requiresSourceAttribution: true;
  requiresApprovalFirstLanguage: true;
  fallbackCopy: string;
  promptTemplate: string;
};

export type AssistantPromptRegistryValidation = {
  valid: boolean;
  errors: string[];
};

export const assistantPromptForbiddenInputKinds = [
  "auth/session payload",
  "API key or secret",
  "billing or payment data",
  "full app export",
  "raw database dump",
  "email inbox body",
  "calendar sync payload",
  "exact street address",
  "device location",
  "map/geocoding result",
  "medical, SSN, or sensitive identity data",
  "real personal data in fixtures",
] as const;

const forbiddenPromptActionPatterns = [
  /autosave/i,
  /background work/i,
  /call the user/i,
  /create a calendar event/i,
  /create memory/i,
  /device location/i,
  /email the/i,
  /geocode/i,
  /mark as done/i,
  /notify/i,
  /real memory/i,
  /remember this/i,
  /schedule (a|the|this)/i,
  /send (a|an|the|this)/i,
  /sync/i,
  /text the/i,
  /use secrets/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedPromptId(value: unknown): value is AssistantPromptId {
  return typeof value === "string" && assistantPromptIds.includes(value as AssistantPromptId);
}

function isAllowedOutputSchema(value: unknown): value is AssistantPromptOutputSchemaName {
  return (
    typeof value === "string" &&
    assistantPromptOutputSchemaNames.includes(value as AssistantPromptOutputSchemaName)
  );
}

function findForbiddenPromptActions(entry: AssistantPromptRegistryEntry): string[] {
  const promptText = `${entry.purpose} ${entry.fallbackCopy} ${entry.promptTemplate}`;

  return forbiddenPromptActionPatterns
    .filter((pattern) => pattern.test(promptText))
    .map((pattern) => String(pattern));
}

export const assistantPromptRegistry: AssistantPromptRegistryEntry[] = [
  {
    id: "intake-suggestion",
    label: "Inbox intake suggestion",
    purpose: "Turn selected capture text into a reviewable task, note, plan, reminder, follow-up, or unsure suggestion.",
    allowedSourceTypes: ["typed-capture", "selected-task", "current-route", "demo-fixture"],
    forbiddenInputs: [...assistantPromptForbiddenInputKinds],
    expectedOutputSchemaName: "AssistantIntakeSuggestionOutputV1",
    requiresSourceAttribution: true,
    requiresApprovalFirstLanguage: true,
    fallbackCopy: "AI is unavailable. Use the local draft preview and existing manual controls.",
    promptTemplate:
      "Use only the provided context packet. Return a sourced draft suggestion with confidence, destination, and needs-review language. The app handles confirmation before anything changes.",
  },
  {
    id: "today-context-read",
    label: "Today context read",
    purpose: "Summarize the selected local day, task, note, and people/place context into one short Today read.",
    allowedSourceTypes: [
      "selected-task",
      "selected-note-context",
      "selected-day-summary",
      "selected-contact-place",
      "current-route",
      "demo-fixture",
    ],
    forbiddenInputs: [...assistantPromptForbiddenInputKinds],
    expectedOutputSchemaName: "AssistantTodayReadOutputV1",
    requiresSourceAttribution: true,
    requiresApprovalFirstLanguage: true,
    fallbackCopy: "AI is unavailable. Today still shows local tasks, context, and place cues.",
    promptTemplate:
      "Use only the provided context packet. Return one calm Today read, one next review move, and source labels for each claim. Keep it suggestion-only.",
  },
  {
    id: "plan-capacity-read",
    label: "Plan capacity read",
    purpose: "Explain the selected day mode and capacity using bounded local day summary and selected task context.",
    allowedSourceTypes: ["selected-day-summary", "selected-task", "current-route", "demo-fixture"],
    forbiddenInputs: [...assistantPromptForbiddenInputKinds],
    expectedOutputSchemaName: "AssistantPlanCapacityOutputV1",
    requiresSourceAttribution: true,
    requiresApprovalFirstLanguage: true,
    fallbackCopy: "AI is unavailable. Plan still shows the local day mode and manual planning controls.",
    promptTemplate:
      "Use only the provided context packet. Return a capacity read with source labels, preview state, and a manual review move. Do not claim that the day was changed.",
  },
  {
    id: "note-context-draft",
    label: "Note context draft",
    purpose: "Turn selected note/context into a short reviewable context draft without claiming real memory.",
    allowedSourceTypes: ["selected-note-context", "typed-capture", "current-route", "demo-fixture"],
    forbiddenInputs: [...assistantPromptForbiddenInputKinds],
    expectedOutputSchemaName: "AssistantNoteContextDraftOutputV1",
    requiresSourceAttribution: true,
    requiresApprovalFirstLanguage: true,
    fallbackCopy: "AI is unavailable. Notes still keep manual saved context and local draft previews.",
    promptTemplate:
      "Use only the provided context packet. Return a sourced context draft for review. Say it is a draft and avoid claims about automatic recall.",
  },
  {
    id: "people-place-cue",
    label: "People and place cue",
    purpose: "Explain who may matter near a place using selected contact place labels only.",
    allowedSourceTypes: ["selected-contact-place", "current-route", "demo-fixture"],
    forbiddenInputs: [...assistantPromptForbiddenInputKinds],
    expectedOutputSchemaName: "AssistantPeoplePlaceCueOutputV1",
    requiresSourceAttribution: true,
    requiresApprovalFirstLanguage: true,
    fallbackCopy: "AI is unavailable. Contacts still show saved city and region labels.",
    promptTemplate:
      "Use only saved place labels from the context packet. Return a sourced people/place cue and state that labels are manual.",
  },
];

export function validateAssistantPromptRegistryEntry(value: unknown): AssistantPromptRegistryValidation {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Prompt registry entry must be an object."],
    };
  }

  if (!isAllowedPromptId(value.id)) {
    errors.push(`Unsupported prompt id: ${String(value.id)}.`);
  }

  if (typeof value.label !== "string" || !value.label.trim()) {
    errors.push("Prompt entry must include a label.");
  }

  if (typeof value.purpose !== "string" || !value.purpose.trim()) {
    errors.push("Prompt entry must include a purpose.");
  }

  const allowedSourceTypes = Array.isArray(value.allowedSourceTypes) ? value.allowedSourceTypes : [];
  if (!allowedSourceTypes.length) {
    errors.push("Prompt entry must name at least one allowed source type.");
  }

  allowedSourceTypes.forEach((sourceType) => {
    if (
      typeof sourceType !== "string" ||
      !allowedAssistantContextSourceTypes.includes(sourceType as AssistantContextSourceType)
    ) {
      errors.push(`Prompt entry uses unsupported context source type: ${String(sourceType)}.`);
    }
  });

  if (!Array.isArray(value.forbiddenInputs) || !value.forbiddenInputs.length) {
    errors.push("Prompt entry must name forbidden inputs.");
  }

  if (!isAllowedOutputSchema(value.expectedOutputSchemaName)) {
    errors.push(`Unsupported output schema name: ${String(value.expectedOutputSchemaName)}.`);
  }

  if (value.requiresSourceAttribution !== true) {
    errors.push("Prompt entry must require source attribution.");
  }

  if (value.requiresApprovalFirstLanguage !== true) {
    errors.push("Prompt entry must require approval-first language.");
  }

  if (typeof value.fallbackCopy !== "string" || !value.fallbackCopy.trim()) {
    errors.push("Prompt entry must include fallback copy.");
  }

  if (typeof value.promptTemplate !== "string" || !value.promptTemplate.trim()) {
    errors.push("Prompt entry must include a prompt template.");
  }

  const forbiddenActions = findForbiddenPromptActions(value as AssistantPromptRegistryEntry);
  if (forbiddenActions.length) {
    errors.push(`Prompt entry includes forbidden action pattern(s): ${forbiddenActions.join(", ")}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAssistantPromptRegistry(
  registry: unknown,
): AssistantPromptRegistryValidation {
  const errors: string[] = [];

  if (!Array.isArray(registry)) {
    return {
      valid: false,
      errors: ["Prompt registry must be an array."],
    };
  }

  const ids = new Set<string>();

  registry.forEach((entry, index) => {
    const validation = validateAssistantPromptRegistryEntry(entry);
    validation.errors.forEach((error) => errors.push(`Entry ${index + 1}: ${error}`));

    if (isRecord(entry) && typeof entry.id === "string") {
      if (ids.has(entry.id)) {
        errors.push(`Entry ${index + 1}: Duplicate prompt id ${entry.id}.`);
      }
      ids.add(entry.id);
    }
  });

  assistantPromptIds.forEach((promptId) => {
    if (!ids.has(promptId)) {
      errors.push(`Prompt registry is missing required prompt id: ${promptId}.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const assistantPromptRegistryValidation = validateAssistantPromptRegistry(assistantPromptRegistry);
