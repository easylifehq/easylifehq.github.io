import { validateAssistantModelOutput } from "../modelContracts/modelOutputValidator";
import type {
  AssistantModelOutputValidationState,
  AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";

export const providerResponseQuarantineVersion =
  "stage-30-provider-response-quarantine-v1" as const;

export type ProviderResponseQuarantineState = "accepted" | "downgraded" | "quarantined";

export const providerResponseQuarantineReasons = [
  "malformed-response",
  "hidden-write-claim",
  "external-action-claim",
  "real-memory-claim",
  "missing-source",
  "missing-destination",
  "unsupported-intent",
  "validation-rejected",
] as const;

export type ProviderResponseQuarantineReason =
  (typeof providerResponseQuarantineReasons)[number];

export type ProviderResponseQuarantineEnvelope = {
  label: "Provider response quarantined";
  copy: string;
  reasons: ProviderResponseQuarantineReason[];
  rawProviderResponseVisible: false;
  renderableAsSuggestion: false;
};

export type ProviderResponseQuarantineResult = {
  version: typeof providerResponseQuarantineVersion;
  state: ProviderResponseQuarantineState;
  validationState: AssistantModelOutputValidationState;
  output?: AssistantModelSuggestionOutput;
  quarantine?: ProviderResponseQuarantineEnvelope;
  errors: string[];
  warnings: string[];
  providerCallState: "not-called";
  hiddenWrites: false;
  externalActions: false;
  rawProviderResponseVisible: false;
};

const hiddenWriteClaimPatterns = [
  /automatically saved/i,
  /created (a|the)?\s?(task|note|context)/i,
  /i saved/i,
  /note saved/i,
  /saved (a|the|this)?\s?(task|note|context)/i,
  /task saved/i,
];

const externalActionClaimPatterns = [
  /calendar event (created|saved|scheduled)/i,
  /device location/i,
  /email (sent|delivered|queued)/i,
  /geocoded/i,
  /notification (created|scheduled|sent)/i,
  /reminder (created|scheduled|saved)/i,
  /sent (an|a|the)/i,
  /synced/i,
  /text (sent|delivered|queued)/i,
];

const realMemoryClaimPatterns = [
  /memory (created|saved|updated)/i,
  /real memory/i,
  /remembered/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function responseText(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function hasPattern(value: unknown, patterns: RegExp[]) {
  const text = responseText(value);
  return patterns.some((pattern) => pattern.test(text));
}

function hasMissingSource(value: unknown, errors: string[]) {
  return (
    !isRecord(value) ||
    !Array.isArray(value.sources) ||
    value.sources.length === 0 ||
    errors.some((error) => /source/i.test(error))
  );
}

function hasMissingDestination(value: unknown, errors: string[]) {
  return (
    !isRecord(value) ||
    typeof value.destinationLabel !== "string" ||
    !value.destinationLabel.trim() ||
    errors.some((error) => /destination/i.test(error))
  );
}

function quarantineReasons(value: unknown, errors: string[]): ProviderResponseQuarantineReason[] {
  const reasons = new Set<ProviderResponseQuarantineReason>();

  if (!isRecord(value) || errors.some((error) => /object|version|schema|confirmation|field|title|summary/i.test(error))) {
    reasons.add("malformed-response");
  }

  if (hasPattern(value, hiddenWriteClaimPatterns)) {
    reasons.add("hidden-write-claim");
  }

  if (hasPattern(value, externalActionClaimPatterns)) {
    reasons.add("external-action-claim");
  }

  if (hasPattern(value, realMemoryClaimPatterns)) {
    reasons.add("real-memory-claim");
  }

  if (hasMissingSource(value, errors)) {
    reasons.add("missing-source");
  }

  if (hasMissingDestination(value, errors)) {
    reasons.add("missing-destination");
  }

  if (errors.some((error) => /intent is unsupported/i.test(error))) {
    reasons.add("unsupported-intent");
  }

  reasons.add("validation-rejected");

  return [...reasons];
}

function createQuarantineEnvelope(
  reasons: ProviderResponseQuarantineReason[],
): ProviderResponseQuarantineEnvelope {
  return {
    label: "Provider response quarantined",
    copy: "The provider-style response was blocked before display. Use local fallback or request a new bounded suggestion.",
    reasons,
    rawProviderResponseVisible: false,
    renderableAsSuggestion: false,
  };
}

export function quarantineProviderResponse(value: unknown): ProviderResponseQuarantineResult {
  const validation = validateAssistantModelOutput(value);

  if (validation.valid && validation.output) {
    return {
      version: providerResponseQuarantineVersion,
      state: validation.safetyState === "downgraded" ? "downgraded" : "accepted",
      validationState: validation.safetyState,
      output: validation.output,
      errors: validation.errors,
      warnings: validation.warnings,
      providerCallState: "not-called",
      hiddenWrites: false,
      externalActions: false,
      rawProviderResponseVisible: false,
    };
  }

  return {
    version: providerResponseQuarantineVersion,
    state: "quarantined",
    validationState: validation.safetyState,
    quarantine: createQuarantineEnvelope(quarantineReasons(value, validation.errors)),
    errors: validation.errors,
    warnings: validation.warnings,
    providerCallState: "not-called",
    hiddenWrites: false,
    externalActions: false,
    rawProviderResponseVisible: false,
  };
}
