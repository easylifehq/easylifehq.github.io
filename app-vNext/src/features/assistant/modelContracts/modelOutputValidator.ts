import {
  assistantIntentTypes,
  confidenceLanguage,
  type AssistantConfidence,
  type AssistantIntentType,
} from "../intentTypes";
import {
  assistantPromptIds,
  assistantPromptOutputSchemaNames,
  type AssistantPromptId,
  type AssistantPromptOutputSchemaName,
} from "../prompts/promptRegistry";
import {
  assistantModelDestinationLabels,
  assistantModelOutputStates,
  assistantModelOutputVersion,
  type AssistantModelDestinationLabel,
  type AssistantModelOutputField,
  type AssistantModelOutputState,
  type AssistantModelOutputSource,
  type AssistantModelOutputValidation,
  type AssistantModelSuggestionOutput,
} from "./modelOutputTypes";

const assistantConfidenceLevels = Object.keys(confidenceLanguage) as AssistantConfidence[];

const forbiddenModelOutputPatterns = [
  /automatically saved/i,
  /background work/i,
  /calendar event (created|saved|scheduled)/i,
  /device location/i,
  /email (sent|delivered|queued)/i,
  /geocoded/i,
  /hidden read/i,
  /i saved/i,
  /memory (created|saved|updated)/i,
  /notification (created|scheduled|sent)/i,
  /real memory/i,
  /reminder (created|scheduled|saved)/i,
  /scheduled for/i,
  /sent (an|a|the)/i,
  /synced/i,
  /task saved/i,
  /text (sent|delivered|queued)/i,
];

const downgradeOnlyPatterns = [
  /will save/i,
  /ready to save/i,
  /saved to/i,
  /scheduled/i,
  /remembered/i,
  /sent/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function textFromOutput(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function hasForbiddenClaim(value: unknown): boolean {
  const outputText = textFromOutput(value);
  return forbiddenModelOutputPatterns.some((pattern) => pattern.test(outputText));
}

function hasDowngradeClaim(value: unknown): boolean {
  const outputText = textFromOutput(value);
  return downgradeOnlyPatterns.some((pattern) => pattern.test(outputText));
}

function validateSources(value: unknown, errors: string[]) {
  if (!Array.isArray(value) || !value.length) {
    errors.push("Model output must include at least one source.");
    return;
  }

  value.forEach((source, index) => {
    if (!isRecord(source)) {
      errors.push(`Source ${index + 1} must be an object.`);
      return;
    }

    if (typeof source.sourceId !== "string" || !source.sourceId.trim()) {
      errors.push(`Source ${index + 1} must include a sourceId.`);
    }

    if (typeof source.sourceLabel !== "string" || !source.sourceLabel.trim()) {
      errors.push(`Source ${index + 1} must include a sourceLabel.`);
    }
  });
}

function validateFields(value: unknown, errors: string[]) {
  if (!Array.isArray(value)) {
    errors.push("Model output fields must be an array.");
    return;
  }

  value.forEach((field, index) => {
    if (!isRecord(field)) {
      errors.push(`Field ${index + 1} must be an object.`);
      return;
    }

    if (typeof field.label !== "string" || !field.label.trim()) {
      errors.push(`Field ${index + 1} must include a label.`);
    }

    if (typeof field.value !== "string") {
      errors.push(`Field ${index + 1} must include a string value.`);
    }

    if (typeof field.editable !== "boolean") {
      errors.push(`Field ${index + 1} must include an editable boolean.`);
    }
  });
}

function validateConfirmation(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("Model output must include a confirmation object.");
    return;
  }

  if (value.required !== true) {
    errors.push("Model output must require explicit confirmation.");
  }

  if (
    value.label !== "Final confirmation required" &&
    value.label !== "Review only" &&
    value.label !== "Preview only"
  ) {
    errors.push("Model output confirmation label is unsupported.");
  }

  if (typeof value.copy !== "string" || !value.copy.trim()) {
    errors.push("Model output confirmation copy is required.");
  }
}

function downgradeOutput(value: AssistantModelSuggestionOutput): AssistantModelSuggestionOutput {
  return {
    ...value,
    state: "needs-review",
    destinationLabel: "Needs review",
    confirmation: {
      required: true,
      label: "Review only",
      copy: "Review this wording before any save action is offered.",
    },
    warnings: [
      ...value.warnings,
      "Downgraded because output wording implied an action or saved state.",
    ],
  };
}

export function validateAssistantModelOutput(value: unknown): AssistantModelOutputValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      safetyState: "rejected",
      errors: ["Model output must be an object."],
      warnings,
    };
  }

  if (value.version !== assistantModelOutputVersion) {
    errors.push(`Model output version must be ${assistantModelOutputVersion}.`);
  }

  if (typeof value.promptId !== "string" || !assistantPromptIds.includes(value.promptId as AssistantPromptId)) {
    errors.push(`Model output promptId is unsupported: ${String(value.promptId)}.`);
  }

  if (
    typeof value.outputSchemaName !== "string" ||
    !assistantPromptOutputSchemaNames.includes(value.outputSchemaName as AssistantPromptOutputSchemaName)
  ) {
    errors.push(`Model output schema is unsupported: ${String(value.outputSchemaName)}.`);
  }

  if (typeof value.intent !== "string" || !assistantIntentTypes.includes(value.intent as AssistantIntentType)) {
    errors.push(`Model output intent is unsupported: ${String(value.intent)}.`);
  }

  if (
    typeof value.confidence !== "string" ||
    !assistantConfidenceLevels.includes(value.confidence as AssistantConfidence)
  ) {
    errors.push(`Model output confidence is unsupported: ${String(value.confidence)}.`);
  }

  if (typeof value.state !== "string" || !assistantModelOutputStates.includes(value.state as AssistantModelOutputState)) {
    errors.push(`Model output state is unsupported: ${String(value.state)}.`);
  }

  if (
    typeof value.destinationLabel !== "string" ||
    !assistantModelDestinationLabels.includes(value.destinationLabel as AssistantModelDestinationLabel)
  ) {
    errors.push(`Model output destination label is unsupported: ${String(value.destinationLabel)}.`);
  }

  if (typeof value.title !== "string" || !value.title.trim()) {
    errors.push("Model output must include a title.");
  }

  if (typeof value.summary !== "string" || !value.summary.trim()) {
    errors.push("Model output must include a summary.");
  }

  validateSources(value.sources, errors);
  validateFields(value.fields, errors);
  validateConfirmation(value.confirmation, errors);

  if (!isStringArray(value.warnings)) {
    errors.push("Model output warnings must be a string array.");
  }

  if (hasForbiddenClaim(value)) {
    errors.push("Model output includes a forbidden hidden-action or external-action claim.");
  }

  if (errors.length) {
    return {
      valid: false,
      safetyState: "rejected",
      errors,
      warnings,
    };
  }

  const typedOutput = value as AssistantModelSuggestionOutput;

  if (hasDowngradeClaim(value)) {
    warnings.push("Model output was downgraded to needs-review because wording was action-like.");

    return {
      valid: true,
      safetyState: "downgraded",
      errors,
      warnings,
      output: downgradeOutput(typedOutput),
    };
  }

  return {
    valid: true,
    safetyState: "accepted",
    errors,
    warnings,
    output: typedOutput,
  };
}
