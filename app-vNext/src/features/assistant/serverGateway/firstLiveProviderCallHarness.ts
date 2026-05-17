import type {
  AssistantModelOutputValidationState,
  AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import { liveAiAllowedPromptId, liveAiAllowedRoutePath } from "./liveAiEnvironment";
import {
  assessLiveProviderSecretBoundary,
  liveProviderSecretBoundaryPlaceholderName,
  type LiveProviderSecretBoundaryCheck,
  type LiveProviderSecretBoundaryResult,
  type LiveProviderSecretBoundaryState,
} from "./liveProviderSecretBoundary";
import {
  providerSanitizedRequestVersion,
  type ProviderSanitizedRequestSummary,
} from "./providerRequestSanitizer";
import {
  quarantineProviderResponse,
  type ProviderResponseQuarantineEnvelope,
  type ProviderResponseQuarantineState,
} from "./providerResponseQuarantine";
import { serverGatewayExpectedOutputSchemaName } from "./serverGatewayTypes";

export const firstLiveProviderCallHarnessVersion =
  "stage-31-first-live-provider-call-harness-v1" as const;

export const firstLiveProviderCallApprovalRecordPath =
  "docs/codex/EASYLIFE_STAGE_31_FIRST_LIVE_AI_APPROVAL_RECORD.md" as const;

export const firstLiveProviderCallRequiredApprovalVerdict =
  "APPROVED_FOR_ONE_SYNTHETIC_INBOX_PROVIDER_CALL" as const;

export const firstLiveProviderCallCurrentApprovalVerdict =
  "NOT_APPROVED_FOR_LIVE_AI" as const;

export const firstLiveProviderCallDefaultEnabled = false as const;

export const firstLiveProviderCallProviderName = "TBD_SERVER_SIDE_PROVIDER" as const;

export const firstLiveProviderCallProviderCallStates = [
  "not-called",
  "called-by-server-executor",
] as const;

export type FirstLiveProviderCallProviderCallState =
  (typeof firstLiveProviderCallProviderCallStates)[number];

export const firstLiveProviderCallFallbackReasons = [
  "disabled",
  "approval-missing",
  "invalid-sanitized-request",
  "secret-boundary-blocked",
  "provider-unconfigured",
  "timeout",
  "rate-limit",
  "circuit-open",
  "provider-executor-missing",
  "provider-error",
  "response-quarantined",
] as const;

export type FirstLiveProviderCallFallbackReason =
  (typeof firstLiveProviderCallFallbackReasons)[number];

export type FirstLiveProviderCallApprovalVerdict =
  | typeof firstLiveProviderCallRequiredApprovalVerdict
  | typeof firstLiveProviderCallCurrentApprovalVerdict;

export type FirstLiveProviderCallProviderRequest = {
  harnessVersion: typeof firstLiveProviderCallHarnessVersion;
  providerName: typeof firstLiveProviderCallProviderName;
  promptId: typeof liveAiAllowedPromptId;
  route: typeof liveAiAllowedRoutePath;
  expectedOutputSchemaName: typeof serverGatewayExpectedOutputSchemaName;
  sanitizedSummary: ProviderSanitizedRequestSummary;
  metadataOnly: true;
};

export type FirstLiveProviderCallExecutor = (
  request: FirstLiveProviderCallProviderRequest,
) => Promise<unknown> | unknown;

export type FirstLiveProviderCallOptions = {
  enabled?: boolean;
  approvalVerdict?: FirstLiveProviderCallApprovalVerdict;
  secretBoundaryCheck?: LiveProviderSecretBoundaryCheck;
  timeout?: boolean;
  rateLimited?: boolean;
  killSwitchOpen?: boolean;
  serverOnlyProviderExecutor?: FirstLiveProviderCallExecutor;
};

export type FirstLiveProviderCallSanitizedValidation = {
  valid: boolean;
  errors: string[];
  summary?: ProviderSanitizedRequestSummary;
};

export type FirstLiveProviderCallFallbackEnvelope = {
  reason: FirstLiveProviderCallFallbackReason;
  label: string;
  copy: string;
  requestId?: string;
  typedCaptureText: string;
  preservesTypedCapture: true;
  deterministicLocalAvailable: true;
  automaticRetry: false;
  providerCallState: FirstLiveProviderCallProviderCallState;
  hiddenWrites: false;
  externalActions: false;
  realMemory: false;
  savedObjectExpansion: false;
};

export type FirstLiveProviderCallResponse = {
  harnessVersion: typeof firstLiveProviderCallHarnessVersion;
  status: "ok" | "fallback";
  requestValidationState: "accepted" | "rejected";
  approvalVerdict: FirstLiveProviderCallApprovalVerdict;
  secretBoundaryState: LiveProviderSecretBoundaryState;
  providerCallState: FirstLiveProviderCallProviderCallState;
  providerCallAttempted: boolean;
  providerName: typeof firstLiveProviderCallProviderName;
  secretPlaceholder: typeof liveProviderSecretBoundaryPlaceholderName;
  sanitizerRequired: true;
  quarantineRequired: true;
  outputValidationState?: AssistantModelOutputValidationState;
  quarantineState?: ProviderResponseQuarantineState;
  output?: AssistantModelSuggestionOutput;
  quarantine?: ProviderResponseQuarantineEnvelope;
  fallback?: FirstLiveProviderCallFallbackEnvelope;
  errors: string[];
  warnings: string[];
  frontendSecretExposure: false;
  directBrowserProviderRequest: false;
  hiddenWrites: false;
  externalActions: false;
  realMemory: false;
  savedObjectExpansion: false;
};

const fallbackCopyByReason: Record<
  FirstLiveProviderCallFallbackReason,
  Pick<FirstLiveProviderCallFallbackEnvelope, "label" | "copy">
> = {
  disabled: {
    label: "First live call disabled",
    copy: "The live provider lane is off. Local deterministic fallback remains available.",
  },
  "approval-missing": {
    label: "Live approval missing",
    copy: "The Stage 31 approval record does not approve a live provider call.",
  },
  "invalid-sanitized-request": {
    label: "Sanitized request rejected",
    copy: "The request was not a bounded Inbox typed-capture summary.",
  },
  "secret-boundary-blocked": {
    label: "Secret boundary blocked",
    copy: "The provider secret boundary rejected this run before any provider call.",
  },
  "provider-unconfigured": {
    label: "Provider unconfigured",
    copy: "No server-side provider secret is configured. Local fallback remains available.",
  },
  timeout: {
    label: "First live call timeout",
    copy: "The typed capture stays here. No automatic retry will run.",
  },
  "rate-limit": {
    label: "First live call rate limit",
    copy: "The typed capture stays here. Use local deterministic fallback.",
  },
  "circuit-open": {
    label: "First live call kill switch active",
    copy: "Provider calls are disabled. Local fallback remains available.",
  },
  "provider-executor-missing": {
    label: "Provider executor missing",
    copy: "No server-only executor is configured. Local fallback remains available.",
  },
  "provider-error": {
    label: "Provider error",
    copy: "The typed capture stays here. No background retry will run.",
  },
  "response-quarantined": {
    label: "Provider response quarantined",
    copy: "The provider-style output was blocked before display.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedInputClass(value: unknown): value is ProviderSanitizedRequestSummary["inputClass"] {
  return value === "synthetic-demo" || value === "private-alpha-typed-capture";
}

function typedCaptureFromSummary(summary: unknown) {
  return isRecord(summary) && typeof summary.typedCaptureText === "string"
    ? summary.typedCaptureText
    : "";
}

function defaultSecretBoundaryCheck(): LiveProviderSecretBoundaryCheck {
  return {
    version: "stage-31-live-provider-secret-boundary-v1",
    placeholderName: liveProviderSecretBoundaryPlaceholderName,
    runtime: "server",
    serverReportsConfigured: false,
  };
}

export function validateFirstLiveProviderSanitizedSummary(
  value: unknown,
): FirstLiveProviderCallSanitizedValidation {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["First live provider call requires a sanitized request summary object."],
    };
  }

  if (value.version !== providerSanitizedRequestVersion) {
    errors.push(`Sanitized summary version must be ${providerSanitizedRequestVersion}.`);
  }

  if (value.safeForProviderDryRun !== true) {
    errors.push("Sanitized summary must be marked safeForProviderDryRun.");
  }

  if (value.route !== liveAiAllowedRoutePath) {
    errors.push(`First live provider call allows only route ${liveAiAllowedRoutePath}.`);
  }

  if (value.promptId !== liveAiAllowedPromptId) {
    errors.push(`First live provider call allows only prompt ${liveAiAllowedPromptId}.`);
  }

  if (value.expectedOutputSchemaName !== serverGatewayExpectedOutputSchemaName) {
    errors.push(`Expected output schema must be ${serverGatewayExpectedOutputSchemaName}.`);
  }

  if (!isAllowedInputClass(value.inputClass)) {
    errors.push("Sanitized summary input class must be synthetic demo or private alpha typed capture.");
  }

  if (value.readPolicy !== "minimum-needed-only") {
    errors.push("Sanitized summary must use minimum-needed-only read policy.");
  }

  if (value.confirmationPolicy !== "suggestions-only") {
    errors.push("Sanitized summary must use suggestions-only confirmation policy.");
  }

  if (typeof value.typedCaptureText !== "string" || !value.typedCaptureText.trim()) {
    errors.push("Sanitized summary must include typed capture text.");
  }

  if (!Array.isArray(value.sourceLabels)) {
    errors.push("Sanitized summary must include source labels.");
  } else {
    const sourceTypes = value.sourceLabels
      .filter(isRecord)
      .map((source) => source.sourceType);

    if (!sourceTypes.includes("typed-capture")) {
      errors.push("Sanitized summary must include a typed-capture source label.");
    }

    if (sourceTypes.some((sourceType) => !["current-route", "typed-capture", "demo-fixture"].includes(String(sourceType)))) {
      errors.push("Sanitized summary contains unsupported source label type.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: errors.length === 0 ? (value as ProviderSanitizedRequestSummary) : undefined,
  };
}

function createFallback(
  reason: FirstLiveProviderCallFallbackReason,
  input?: {
    summaryLike?: unknown;
    errors?: string[];
    warnings?: string[];
    approvalVerdict?: FirstLiveProviderCallApprovalVerdict;
    secretBoundary?: LiveProviderSecretBoundaryResult;
    providerCallState?: FirstLiveProviderCallProviderCallState;
    providerCallAttempted?: boolean;
    outputValidationState?: AssistantModelOutputValidationState;
    quarantineState?: ProviderResponseQuarantineState;
    quarantine?: ProviderResponseQuarantineEnvelope;
  },
): FirstLiveProviderCallResponse {
  const copy = fallbackCopyByReason[reason];
  const summaryLike = input?.summaryLike;
  const providerCallState = input?.providerCallState ?? "not-called";
  const approvalVerdict = input?.approvalVerdict ?? firstLiveProviderCallCurrentApprovalVerdict;
  const secretBoundary =
    input?.secretBoundary ?? assessLiveProviderSecretBoundary(defaultSecretBoundaryCheck());

  return {
    harnessVersion: firstLiveProviderCallHarnessVersion,
    status: "fallback",
    requestValidationState: reason === "invalid-sanitized-request" ? "rejected" : "accepted",
    approvalVerdict,
    secretBoundaryState: secretBoundary.state,
    providerCallState,
    providerCallAttempted: input?.providerCallAttempted ?? false,
    providerName: firstLiveProviderCallProviderName,
    secretPlaceholder: liveProviderSecretBoundaryPlaceholderName,
    sanitizerRequired: true,
    quarantineRequired: true,
    outputValidationState: input?.outputValidationState,
    quarantineState: input?.quarantineState,
    quarantine: input?.quarantine,
    fallback: {
      reason,
      label: copy.label,
      copy: copy.copy,
      requestId: isRecord(summaryLike) && typeof summaryLike.requestId === "string"
        ? summaryLike.requestId
        : undefined,
      typedCaptureText: typedCaptureFromSummary(summaryLike),
      preservesTypedCapture: true,
      deterministicLocalAvailable: true,
      automaticRetry: false,
      providerCallState,
      hiddenWrites: false,
      externalActions: false,
      realMemory: false,
      savedObjectExpansion: false,
    },
    errors: input?.errors ?? [],
    warnings: input?.warnings ?? [],
    frontendSecretExposure: false,
    directBrowserProviderRequest: false,
    hiddenWrites: false,
    externalActions: false,
    realMemory: false,
    savedObjectExpansion: false,
  };
}

export async function runFirstLiveProviderCallHarness(
  sanitizedSummaryLike: unknown,
  options: FirstLiveProviderCallOptions = {},
): Promise<FirstLiveProviderCallResponse> {
  const sanitizedValidation = validateFirstLiveProviderSanitizedSummary(sanitizedSummaryLike);
  const approvalVerdict = options.approvalVerdict ?? firstLiveProviderCallCurrentApprovalVerdict;
  const secretBoundary = assessLiveProviderSecretBoundary(
    options.secretBoundaryCheck ?? defaultSecretBoundaryCheck(),
  );

  if (!sanitizedValidation.valid || !sanitizedValidation.summary) {
    return createFallback("invalid-sanitized-request", {
      summaryLike: sanitizedSummaryLike,
      errors: sanitizedValidation.errors,
      approvalVerdict,
      secretBoundary,
    });
  }

  const summary = sanitizedValidation.summary;

  if ((options.enabled ?? firstLiveProviderCallDefaultEnabled) !== true) {
    return createFallback("disabled", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
    });
  }

  if (approvalVerdict !== firstLiveProviderCallRequiredApprovalVerdict) {
    return createFallback("approval-missing", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
      errors: [`Approval record must end ${firstLiveProviderCallRequiredApprovalVerdict}.`],
    });
  }

  if (!secretBoundary.valid || secretBoundary.providerCallAllowed !== true) {
    return createFallback(
      secretBoundary.state === "server-secret-unconfigured"
        ? "provider-unconfigured"
        : "secret-boundary-blocked",
      {
        summaryLike: summary,
        approvalVerdict,
        secretBoundary,
        errors: secretBoundary.errors,
        warnings: secretBoundary.warnings,
      },
    );
  }

  if (options.killSwitchOpen) {
    return createFallback("circuit-open", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
    });
  }

  if (options.rateLimited) {
    return createFallback("rate-limit", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
    });
  }

  if (options.timeout) {
    return createFallback("timeout", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
    });
  }

  if (!options.serverOnlyProviderExecutor) {
    return createFallback("provider-executor-missing", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
    });
  }

  const providerRequest: FirstLiveProviderCallProviderRequest = {
    harnessVersion: firstLiveProviderCallHarnessVersion,
    providerName: firstLiveProviderCallProviderName,
    promptId: liveAiAllowedPromptId,
    route: liveAiAllowedRoutePath,
    expectedOutputSchemaName: serverGatewayExpectedOutputSchemaName,
    sanitizedSummary: summary,
    metadataOnly: true,
  };

  try {
    const providerStyleOutput = await options.serverOnlyProviderExecutor(providerRequest);
    const quarantine = quarantineProviderResponse(providerStyleOutput);
    const providerCallState: FirstLiveProviderCallProviderCallState = "called-by-server-executor";

    if (quarantine.state === "quarantined" || !quarantine.output) {
      return createFallback("response-quarantined", {
        summaryLike: summary,
        approvalVerdict,
        secretBoundary,
        providerCallState,
        providerCallAttempted: true,
        outputValidationState: quarantine.validationState,
        quarantineState: quarantine.state,
        quarantine: quarantine.quarantine,
        errors: quarantine.errors,
        warnings: quarantine.warnings,
      });
    }

    return {
      harnessVersion: firstLiveProviderCallHarnessVersion,
      status: "ok",
      requestValidationState: "accepted",
      approvalVerdict,
      secretBoundaryState: secretBoundary.state,
      providerCallState,
      providerCallAttempted: true,
      providerName: firstLiveProviderCallProviderName,
      secretPlaceholder: liveProviderSecretBoundaryPlaceholderName,
      sanitizerRequired: true,
      quarantineRequired: true,
      outputValidationState: quarantine.validationState,
      quarantineState: quarantine.state,
      output: quarantine.output,
      errors: quarantine.errors,
      warnings: quarantine.warnings,
      frontendSecretExposure: false,
      directBrowserProviderRequest: false,
      hiddenWrites: false,
      externalActions: false,
      realMemory: false,
      savedObjectExpansion: false,
    };
  } catch {
    return createFallback("provider-error", {
      summaryLike: summary,
      approvalVerdict,
      secretBoundary,
      providerCallState: "called-by-server-executor",
      providerCallAttempted: true,
      errors: ["Server-only provider executor failed inside the first-live-call harness."],
    });
  }
}
