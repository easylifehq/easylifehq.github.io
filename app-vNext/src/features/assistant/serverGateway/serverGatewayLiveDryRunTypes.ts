import {
  createAssistantContextPacket,
  type AssistantContextPacket,
  type AssistantContextSource,
} from "../modelContracts/contextPacket";
import {
  assistantModelOutputVersion,
  type AssistantModelOutputValidationState,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import type { AssistantPromptId } from "../prompts/promptRegistry";
import {
  extractServerGatewayTypedCaptureText,
  serverGatewayAllowedBehavior,
  serverGatewayAllowedContextPacketVersion,
  serverGatewayAllowedPromptId,
  serverGatewayAllowedSurface,
  serverGatewayExpectedOutputSchemaName,
  serverGatewayRequestVersion,
  validateServerGatewayRequest,
  type ServerGatewayRequestEnvelope,
} from "./serverGatewayTypes";

export const serverGatewayLiveDryRunResponseVersion =
  "stage-26-live-dry-run-response-v1" as const;

export const serverGatewayLiveDryRunFallbackVersion =
  "stage-26-live-dry-run-fallback-v1" as const;

export const serverGatewayLiveDryRunMetadataVersion =
  "stage-26-live-dry-run-metadata-v1" as const;

export const serverGatewayLiveDryRunRoutePath = "/app/easylist/add?demo=1" as const;

export const serverGatewayLiveDryRunPromptId =
  "intake-suggestion" as const satisfies AssistantPromptId;

export const serverGatewayLiveDryRunProviderPlaceholder =
  "TBD_SERVER_SIDE_PROVIDER" as const;

export const serverGatewayLiveDryRunSecretPlaceholder =
  "SERVER_AI_PROVIDER_API_KEY" as const;

export const serverGatewayLiveDryRunDefaultEnabled = false as const;

export const serverGatewayLiveDryRunMaxProviderRequests = 5 as const;

export const serverGatewayLiveDryRunMaxSpendUsd = 1 as const;

export const serverGatewayLiveDryRunPerUserDailyCap = 10 as const;

export const serverGatewayLiveDryRunShortWindowSeconds = 60 as const;

export const serverGatewayLiveDryRunTimeoutMs = 15000 as const;

export const serverGatewayLiveDryRunAllowedRuntime = "server" as const;

export const serverGatewayLiveDryRunBrowserRuntime = "browser" as const;

export type ServerGatewayLiveDryRunRuntime =
  | typeof serverGatewayLiveDryRunAllowedRuntime
  | typeof serverGatewayLiveDryRunBrowserRuntime;

export const serverGatewayLiveDryRunProviderCallStates = [
  "not-called",
  "called-by-server-executor",
] as const;

export type ServerGatewayLiveDryRunProviderCallState =
  (typeof serverGatewayLiveDryRunProviderCallStates)[number];

export const serverGatewayLiveDryRunFallbackReasons = [
  "ai-disabled",
  "server-only-required",
  "provider-unconfigured",
  "invalid-request",
  "timeout",
  "rate-limit",
  "circuit-open",
  "validation-rejected",
  "provider-error",
] as const;

export type ServerGatewayLiveDryRunFallbackReason =
  (typeof serverGatewayLiveDryRunFallbackReasons)[number];

export type ServerGatewayLiveDryRunMetadataLog = {
  version: typeof serverGatewayLiveDryRunMetadataVersion;
  requestId?: string;
  route: typeof serverGatewayLiveDryRunRoutePath | "unknown";
  promptId: typeof serverGatewayLiveDryRunPromptId | "unknown";
  schemaVersion: typeof assistantModelOutputVersion;
  fallbackReason?: ServerGatewayLiveDryRunFallbackReason;
  validationResult: AssistantModelOutputValidationState | "not-run";
  latencyBucket: "not-measured" | "under-15s" | "timed-out";
  tokenEstimateBucket: "synthetic-small" | "not-sent";
  rateLimitBucket: "within-stage-26-cap" | "blocked";
  providerCallAttempted: boolean;
  metadataOnly: true;
};

export type ServerGatewayLiveDryRunFallbackEnvelope = {
  fallbackVersion: typeof serverGatewayLiveDryRunFallbackVersion;
  reason: ServerGatewayLiveDryRunFallbackReason;
  label: string;
  copy: string;
  requestId?: string;
  typedCaptureText: string;
  preservesTypedCapture: true;
  deterministicLocalAvailable: true;
  automaticRetry: false;
  providerCallState: ServerGatewayLiveDryRunProviderCallState;
  frontendSecretExposure: false;
  directBrowserProviderRequest: false;
  externalActions: false;
  hiddenWrites: false;
};

export type ServerGatewayLiveDryRunResponseEnvelope = {
  responseVersion: typeof serverGatewayLiveDryRunResponseVersion;
  requestId?: string;
  status: "ok" | "fallback";
  requestValidationState: "accepted" | "rejected";
  outputValidationState?: AssistantModelOutputValidationState;
  output?: AssistantModelSuggestionOutput;
  fallback?: ServerGatewayLiveDryRunFallbackEnvelope;
  metadataLog: ServerGatewayLiveDryRunMetadataLog;
  errors: string[];
  warnings: string[];
  providerName: typeof serverGatewayLiveDryRunProviderPlaceholder;
  secretPlaceholder: typeof serverGatewayLiveDryRunSecretPlaceholder;
  providerCallState: ServerGatewayLiveDryRunProviderCallState;
  runtime: ServerGatewayLiveDryRunRuntime;
  frontendSecretExposure: false;
  directBrowserProviderRequest: false;
  externalActions: false;
  hiddenWrites: false;
};

export type ServerGatewayLiveDryRunValidation = {
  valid: boolean;
  errors: string[];
  request?: ServerGatewayRequestEnvelope;
};

export type ServerGatewayLiveDryRunConfig = {
  enabled?: boolean;
  runtime?: ServerGatewayLiveDryRunRuntime;
  providerConfigured?: boolean;
  killSwitchOpen?: boolean;
  rateLimited?: boolean;
  timeout?: boolean;
};

export type ServerGatewayLiveDryRunProviderRequest = {
  promptId: typeof serverGatewayLiveDryRunPromptId;
  expectedOutputSchemaName: typeof serverGatewayExpectedOutputSchemaName;
  contextPacket: AssistantContextPacket;
  metadata: ServerGatewayLiveDryRunMetadataLog;
};

export type ServerGatewayLiveDryRunProviderExecutor = (
  request: ServerGatewayLiveDryRunProviderRequest,
) => Promise<unknown> | unknown;

export type ServerGatewayLiveDryRunOptions = {
  config?: ServerGatewayLiveDryRunConfig;
  serverOnlyProviderExecutor?: ServerGatewayLiveDryRunProviderExecutor;
};

export type ServerGatewayLiveDryRunTypedCaptureInput = {
  requestId: string;
  typedCaptureText: string;
};

const fallbackCopyByReason: Record<
  ServerGatewayLiveDryRunFallbackReason,
  Pick<ServerGatewayLiveDryRunFallbackEnvelope, "label" | "copy">
> = {
  "ai-disabled": {
    label: "Live provider dry run disabled",
    copy: "The typed capture stays here. Local deterministic suggestions remain available.",
  },
  "server-only-required": {
    label: "Server-only gateway required",
    copy: "The browser cannot call the provider directly. Local fallback stays available.",
  },
  "provider-unconfigured": {
    label: "Provider not configured",
    copy: "No server-side provider executor is configured. Use local fallback.",
  },
  "invalid-request": {
    label: "Live dry-run request rejected",
    copy: "The request was outside the synthetic Inbox typed-capture boundary.",
  },
  timeout: {
    label: "Live dry-run timeout",
    copy: "The typed capture stays here. No automatic retry will run.",
  },
  "rate-limit": {
    label: "Live dry-run rate limit",
    copy: "The typed capture stays here. Try local deterministic suggestions.",
  },
  "circuit-open": {
    label: "Live dry-run kill switch active",
    copy: "Provider calls are disabled. Local fallback remains available.",
  },
  "validation-rejected": {
    label: "Live dry-run output rejected",
    copy: "The provider output was blocked before it could be offered.",
  },
  "provider-error": {
    label: "Live dry-run provider error",
    copy: "The typed capture stays here. No background retry will run.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function liveDryRunSources(request: ServerGatewayRequestEnvelope): AssistantContextSource[] {
  return request.contextPacket.sources;
}

function typedCaptureText(requestLike: unknown): string {
  return extractServerGatewayTypedCaptureText(requestLike);
}

export function createServerGatewayLiveDryRunTypedCaptureRequest(
  input: ServerGatewayLiveDryRunTypedCaptureInput,
): ServerGatewayRequestEnvelope {
  return {
    requestVersion: serverGatewayRequestVersion,
    behavior: serverGatewayAllowedBehavior,
    promptId: serverGatewayAllowedPromptId,
    expectedOutputSchemaName: serverGatewayExpectedOutputSchemaName,
    surface: serverGatewayAllowedSurface,
    contextPacket: createAssistantContextPacket({
      requestId: input.requestId,
      route: {
        routeId: "inbox",
        routeLabel: "Inbox",
        path: serverGatewayLiveDryRunRoutePath,
      },
      sources: [
        {
          id: `${input.requestId}-capture`,
          sourceType: "typed-capture",
          sourceLabel: "Synthetic typed capture",
          text: input.typedCaptureText,
          state: "draft",
        },
        {
          id: `${input.requestId}-fixture`,
          sourceType: "demo-fixture",
          sourceLabel: "Demo fixture",
          fixtureName: "Stage 26 live dry-run fixture",
          description: "Synthetic provider dry-run data only; not real user data.",
        },
      ],
    }),
  };
}

export function validateServerGatewayLiveDryRunRequest(
  value: unknown,
): ServerGatewayLiveDryRunValidation {
  const validation = validateServerGatewayRequest(value);
  const errors = [...validation.errors];

  if (!validation.valid || !validation.request) {
    return {
      valid: false,
      errors,
    };
  }

  const request = validation.request;
  const route = request.contextPacket.route;
  const sources = liveDryRunSources(request);
  const hasDemoFixture = sources.some((source) => source.sourceType === "demo-fixture");
  const typedCapture = sources.find((source) => source.sourceType === "typed-capture");

  if (route.path !== serverGatewayLiveDryRunRoutePath) {
    errors.push(`Stage 26 live dry run allows only ${serverGatewayLiveDryRunRoutePath}.`);
  }

  if (request.contextPacket.version !== serverGatewayAllowedContextPacketVersion) {
    errors.push(`Stage 26 live dry run requires ${serverGatewayAllowedContextPacketVersion}.`);
  }

  if (request.promptId !== serverGatewayLiveDryRunPromptId) {
    errors.push(`Stage 26 live dry run allows only ${serverGatewayLiveDryRunPromptId}.`);
  }

  if (!hasDemoFixture) {
    errors.push("Stage 26 live dry run requires a demo-fixture source.");
  }

  if (!typedCapture || typedCapture.sourceLabel !== "Synthetic typed capture") {
    errors.push("Stage 26 live dry run requires synthetic/demo typed capture labeling.");
  }

  return {
    valid: errors.length === 0,
    errors,
    request: errors.length === 0 ? request : undefined,
  };
}

export function createServerGatewayLiveDryRunMetadataLog(input?: {
  requestLike?: unknown;
  fallbackReason?: ServerGatewayLiveDryRunFallbackReason;
  validationResult?: AssistantModelOutputValidationState | "not-run";
  providerCallAttempted?: boolean;
  latencyBucket?: ServerGatewayLiveDryRunMetadataLog["latencyBucket"];
  rateLimitBucket?: ServerGatewayLiveDryRunMetadataLog["rateLimitBucket"];
}): ServerGatewayLiveDryRunMetadataLog {
  const requestLike = input?.requestLike;
  const contextPacket = isRecord(requestLike) && isRecord(requestLike.contextPacket)
    ? requestLike.contextPacket
    : undefined;
  const route = isRecord(contextPacket) && isRecord(contextPacket.route) && contextPacket.route.path === serverGatewayLiveDryRunRoutePath
    ? serverGatewayLiveDryRunRoutePath
    : "unknown";
  const promptId =
    isRecord(requestLike) && requestLike.promptId === serverGatewayLiveDryRunPromptId
      ? serverGatewayLiveDryRunPromptId
      : "unknown";

  return {
    version: serverGatewayLiveDryRunMetadataVersion,
    requestId: isRecord(contextPacket) && typeof contextPacket.requestId === "string"
      ? contextPacket.requestId
      : undefined,
    route,
    promptId,
    schemaVersion: assistantModelOutputVersion,
    fallbackReason: input?.fallbackReason,
    validationResult: input?.validationResult ?? "not-run",
    latencyBucket: input?.latencyBucket ?? "not-measured",
    tokenEstimateBucket: input?.providerCallAttempted ? "synthetic-small" : "not-sent",
    rateLimitBucket: input?.rateLimitBucket ?? "within-stage-26-cap",
    providerCallAttempted: input?.providerCallAttempted ?? false,
    metadataOnly: true,
  };
}

export function createServerGatewayLiveDryRunFallbackEnvelope(
  reason: ServerGatewayLiveDryRunFallbackReason,
  input?: {
    requestLike?: unknown;
    typedCaptureText?: string;
    providerCallState?: ServerGatewayLiveDryRunProviderCallState;
  },
): ServerGatewayLiveDryRunFallbackEnvelope {
  const copy = fallbackCopyByReason[reason];

  return {
    fallbackVersion: serverGatewayLiveDryRunFallbackVersion,
    reason,
    label: copy.label,
    copy: copy.copy,
    requestId: createServerGatewayLiveDryRunMetadataLog({ requestLike: input?.requestLike }).requestId,
    typedCaptureText: input?.typedCaptureText ?? typedCaptureText(input?.requestLike),
    preservesTypedCapture: true,
    deterministicLocalAvailable: true,
    automaticRetry: false,
    providerCallState: input?.providerCallState ?? "not-called",
    frontendSecretExposure: false,
    directBrowserProviderRequest: false,
    externalActions: false,
    hiddenWrites: false,
  };
}

export function createServerGatewayLiveDryRunFallbackResponse(
  reason: ServerGatewayLiveDryRunFallbackReason,
  input?: {
    requestLike?: unknown;
    errors?: string[];
    warnings?: string[];
    requestValidationState?: "accepted" | "rejected";
    runtime?: ServerGatewayLiveDryRunRuntime;
    providerCallAttempted?: boolean;
    providerCallState?: ServerGatewayLiveDryRunProviderCallState;
    validationResult?: AssistantModelOutputValidationState | "not-run";
    rateLimitBucket?: ServerGatewayLiveDryRunMetadataLog["rateLimitBucket"];
    latencyBucket?: ServerGatewayLiveDryRunMetadataLog["latencyBucket"];
  },
): ServerGatewayLiveDryRunResponseEnvelope {
  const providerCallState = input?.providerCallState ?? "not-called";

  return {
    responseVersion: serverGatewayLiveDryRunResponseVersion,
    requestId: createServerGatewayLiveDryRunMetadataLog({ requestLike: input?.requestLike }).requestId,
    status: "fallback",
    requestValidationState: input?.requestValidationState ?? "accepted",
    outputValidationState: input?.validationResult === "not-run" ? undefined : input?.validationResult,
    fallback: createServerGatewayLiveDryRunFallbackEnvelope(reason, {
      requestLike: input?.requestLike,
      providerCallState,
    }),
    metadataLog: createServerGatewayLiveDryRunMetadataLog({
      requestLike: input?.requestLike,
      fallbackReason: reason,
      validationResult: input?.validationResult,
      providerCallAttempted: input?.providerCallAttempted,
      rateLimitBucket: input?.rateLimitBucket,
      latencyBucket: input?.latencyBucket,
    }),
    errors: input?.errors ?? [],
    warnings: input?.warnings ?? [],
    providerName: serverGatewayLiveDryRunProviderPlaceholder,
    secretPlaceholder: serverGatewayLiveDryRunSecretPlaceholder,
    providerCallState,
    runtime: input?.runtime ?? serverGatewayLiveDryRunBrowserRuntime,
    frontendSecretExposure: false,
    directBrowserProviderRequest: false,
    externalActions: false,
    hiddenWrites: false,
  };
}
