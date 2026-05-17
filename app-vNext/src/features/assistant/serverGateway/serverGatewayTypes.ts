import {
  assistantContextPacketVersion,
  createAssistantContextPacket,
  validateAssistantContextPacket,
  type AssistantContextPacket,
  type AssistantContextRoute,
  type AssistantContextSource,
  type AssistantContextSourceType,
} from "../modelContracts/contextPacket";
import {
  assistantModelOutputVersion,
  type AssistantModelOutputValidationState,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import {
  assistantPromptIds,
  type AssistantPromptId,
  type AssistantPromptOutputSchemaName,
} from "../prompts/promptRegistry";

export const serverGatewayRequestVersion = "stage-24-server-gateway-request-v1" as const;

export const serverGatewayResponseVersion = "stage-24-server-gateway-response-v1" as const;

export const serverGatewayFallbackVersion = "stage-24-server-gateway-fallback-v1" as const;

export const serverGatewayAllowedBehavior = "inbox-typed-capture-suggestion" as const;

export const serverGatewayAllowedPromptId = "intake-suggestion" as const satisfies AssistantPromptId;

export const serverGatewayAllowedSurface = "inbox" as const;

export const serverGatewayAllowedRouteId = "inbox" as const satisfies AssistantContextRoute;

export const serverGatewayAllowedPathPrefix = "/app/easylist/add" as const;

export const serverGatewayAllowedContextPacketVersion = assistantContextPacketVersion;

export const serverGatewayAllowedOutputVersion = assistantModelOutputVersion;

export const serverGatewayExpectedOutputSchemaName =
  "AssistantIntakeSuggestionOutputV1" as const satisfies AssistantPromptOutputSchemaName;

export const serverGatewayAllowedSourceTypes = [
  "current-route",
  "typed-capture",
  "demo-fixture",
] as const satisfies AssistantContextSourceType[];

export const serverGatewayProviderCallState = "not-called" as const;

export const serverGatewayNetworkCallState = "not-called" as const;

export const serverGatewayValidationStates = ["accepted", "rejected", "fallback"] as const;

export type ServerGatewayValidationState = (typeof serverGatewayValidationStates)[number];

export type ServerGatewayAllowedSourceType = (typeof serverGatewayAllowedSourceTypes)[number];

export type ServerGatewayBehavior = typeof serverGatewayAllowedBehavior;

export type ServerGatewaySurface = typeof serverGatewayAllowedSurface;

export type ServerGatewayRequestEnvelope = {
  requestVersion: typeof serverGatewayRequestVersion;
  behavior: ServerGatewayBehavior;
  promptId: typeof serverGatewayAllowedPromptId;
  expectedOutputSchemaName: typeof serverGatewayExpectedOutputSchemaName;
  surface: ServerGatewaySurface;
  contextPacket: AssistantContextPacket;
};

export type ServerGatewayRequestValidation = {
  valid: boolean;
  validationState: Extract<ServerGatewayValidationState, "accepted" | "rejected">;
  errors: string[];
  request?: ServerGatewayRequestEnvelope;
};

export const serverGatewayFallbackReasons = [
  "ai-disabled",
  "timeout",
  "rate-limit",
  "circuit-open",
  "invalid-request",
  "validation-rejected",
] as const;

export type ServerGatewayFallbackReason = (typeof serverGatewayFallbackReasons)[number];

export type ServerGatewayFallbackEnvelope = {
  fallbackVersion: typeof serverGatewayFallbackVersion;
  reason: ServerGatewayFallbackReason;
  label: string;
  copy: string;
  requestId?: string;
  typedCaptureText: string;
  preservesTypedCapture: true;
  deterministicLocalAvailable: true;
  automaticRetry: false;
  providerCallState: typeof serverGatewayProviderCallState;
  networkCallState: typeof serverGatewayNetworkCallState;
  externalActions: false;
  hiddenWrites: false;
};

export type ServerGatewayResponseEnvelope = {
  responseVersion: typeof serverGatewayResponseVersion;
  requestId?: string;
  status: "ok" | "fallback";
  requestValidationState: ServerGatewayValidationState;
  outputValidationState?: AssistantModelOutputValidationState;
  output?: AssistantModelSuggestionOutput;
  fallback?: ServerGatewayFallbackEnvelope;
  errors: string[];
  warnings: string[];
  providerCallState: typeof serverGatewayProviderCallState;
  networkCallState: typeof serverGatewayNetworkCallState;
  externalActions: false;
  hiddenWrites: false;
};

export type ServerGatewayTypedCaptureRequestInput = {
  requestId: string;
  typedCaptureText: string;
  includeDemoFixture?: boolean;
};

const maxServerGatewaySources = 3;
const maxTypedCaptureLength = 500;

const serverGatewayRequestForbiddenKeyPatterns = [
  /api[-_]?key/i,
  /auth/i,
  /cookie/i,
  /credential/i,
  /endpoint/i,
  /firebase/i,
  /network[-_]?url/i,
  /provider/i,
  /secret/i,
  /session/i,
  /token/i,
];

const fallbackCopyByReason: Record<ServerGatewayFallbackReason, Pick<ServerGatewayFallbackEnvelope, "label" | "copy">> = {
  "ai-disabled": {
    label: "Server adapter AI disabled",
    copy: "No provider is connected. Use the local draft preview and existing manual save controls.",
  },
  timeout: {
    label: "Server adapter timeout",
    copy: "The typed capture stays here. No automatic background retry will run.",
  },
  "rate-limit": {
    label: "Server adapter rate limit",
    copy: "The typed capture stays here. Local deterministic suggestions remain available.",
  },
  "circuit-open": {
    label: "Server adapter circuit open",
    copy: "The typed capture stays here while model-shaped output is paused.",
  },
  "invalid-request": {
    label: "Server adapter request rejected",
    copy: "The typed capture stays here, but the request was outside the allowed Inbox boundary.",
  },
  "validation-rejected": {
    label: "Server adapter output rejected",
    copy: "The typed capture stays here. The output was blocked before it could be offered.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedPromptId(value: unknown): value is AssistantPromptId {
  return typeof value === "string" && assistantPromptIds.includes(value as AssistantPromptId);
}

function isAllowedServerGatewaySourceType(value: unknown): value is ServerGatewayAllowedSourceType {
  return (
    typeof value === "string" &&
    serverGatewayAllowedSourceTypes.includes(value as ServerGatewayAllowedSourceType)
  );
}

function getSources(value: unknown): unknown[] {
  if (!isRecord(value)) return [];
  return Array.isArray(value.sources) ? value.sources : [];
}

function getTypedCaptureSources(sources: unknown[]) {
  return sources.filter((source) => isRecord(source) && source.sourceType === "typed-capture");
}

function typedCaptureText(source: unknown) {
  return isRecord(source) && typeof source.text === "string" ? source.text : "";
}

function findForbiddenRequestKeys(value: unknown, path = "request"): string[] {
  if (!isRecord(value) && !Array.isArray(value)) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findForbiddenRequestKeys(item, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, entryValue]) => {
    const nextPath = `${path}.${key}`;
    const keyErrors = serverGatewayRequestForbiddenKeyPatterns.some((pattern) => pattern.test(key))
      ? [nextPath]
      : [];

    return [...keyErrors, ...findForbiddenRequestKeys(entryValue, nextPath)];
  });
}

export function createServerGatewayTypedCaptureRequest(
  input: ServerGatewayTypedCaptureRequestInput,
): ServerGatewayRequestEnvelope {
  const sources: AssistantContextSource[] = [
    {
      id: `${input.requestId}-capture`,
      sourceType: "typed-capture",
      sourceLabel: "Typed capture",
      text: input.typedCaptureText,
      state: "draft",
    },
  ];

  if (input.includeDemoFixture) {
    sources.push({
      id: `${input.requestId}-fixture`,
      sourceType: "demo-fixture",
      sourceLabel: "Demo fixture",
      fixtureName: "Stage 24 server adapter fixture",
      description: "Synthetic no-provider proof data only.",
    });
  }

  return {
    requestVersion: serverGatewayRequestVersion,
    behavior: serverGatewayAllowedBehavior,
    promptId: serverGatewayAllowedPromptId,
    expectedOutputSchemaName: serverGatewayExpectedOutputSchemaName,
    surface: serverGatewayAllowedSurface,
    contextPacket: createAssistantContextPacket({
      requestId: input.requestId,
      route: {
        routeId: serverGatewayAllowedRouteId,
        routeLabel: "Inbox",
        path: serverGatewayAllowedPathPrefix,
      },
      sources,
    }),
  };
}

export function validateServerGatewayRequest(value: unknown): ServerGatewayRequestValidation {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      validationState: "rejected",
      errors: ["Server gateway request must be an object."],
    };
  }

  if (value.requestVersion !== serverGatewayRequestVersion) {
    errors.push(`Server gateway request version must be ${serverGatewayRequestVersion}.`);
  }

  if (value.behavior !== serverGatewayAllowedBehavior) {
    errors.push(`Server gateway behavior must be ${serverGatewayAllowedBehavior}.`);
  }

  if (!isAllowedPromptId(value.promptId)) {
    errors.push(`Server gateway prompt id is unsupported: ${String(value.promptId)}.`);
  } else if (value.promptId !== serverGatewayAllowedPromptId) {
    errors.push(`Server gateway allows only ${serverGatewayAllowedPromptId}.`);
  }

  if (value.expectedOutputSchemaName !== serverGatewayExpectedOutputSchemaName) {
    errors.push(`Server gateway output schema must be ${serverGatewayExpectedOutputSchemaName}.`);
  }

  if (value.surface !== serverGatewayAllowedSurface) {
    errors.push(`Server gateway surface must be ${serverGatewayAllowedSurface}.`);
  }

  const forbiddenKeys = findForbiddenRequestKeys(value).filter(
    (keyPath) => !keyPath.startsWith("request.contextPacket"),
  );
  if (forbiddenKeys.length) {
    errors.push(`Server gateway request includes forbidden envelope key(s): ${forbiddenKeys.join(", ")}.`);
  }

  const contextPacket = value.contextPacket;
  const contextValidation = validateAssistantContextPacket(contextPacket);
  if (!contextValidation.valid) {
    errors.push(...contextValidation.errors.map((error) => `Context packet rejected: ${error}`));
  }

  if (!isRecord(contextPacket)) {
    errors.push("Server gateway request must include a context packet.");
  } else {
    if (contextPacket.version !== serverGatewayAllowedContextPacketVersion) {
      errors.push(`Server gateway context packet version must be ${serverGatewayAllowedContextPacketVersion}.`);
    }

    const route = isRecord(contextPacket.route) ? contextPacket.route : {};
    if (route.routeId !== serverGatewayAllowedRouteId) {
      errors.push(`Server gateway context route must be ${serverGatewayAllowedRouteId}.`);
    }

    if (typeof route.path !== "string" || !route.path.startsWith(serverGatewayAllowedPathPrefix)) {
      errors.push("Server gateway context path must target the Inbox typed-capture route.");
    }

    const sources = getSources(contextPacket);
    if (sources.length > maxServerGatewaySources) {
      errors.push(`Server gateway may include at most ${maxServerGatewaySources} sources.`);
    }

    sources.forEach((source, index) => {
      if (!isRecord(source)) {
        errors.push(`Server gateway source ${index + 1} must be an object.`);
        return;
      }

      if (!isAllowedServerGatewaySourceType(source.sourceType)) {
        errors.push(`Server gateway source ${index + 1} has forbidden source type: ${String(source.sourceType)}.`);
      }
    });

    const hasCurrentRoute = sources.some((source) => isRecord(source) && source.sourceType === "current-route");
    if (!hasCurrentRoute) {
      errors.push("Server gateway request must include a current-route source.");
    }

    const typedCaptures = getTypedCaptureSources(sources);
    if (typedCaptures.length !== 1) {
      errors.push("Server gateway request must include exactly one typed-capture source.");
    }

    const captureText = typedCaptureText(typedCaptures[0]).trim();
    if (!captureText) {
      errors.push("Server gateway typed capture must not be empty.");
    }

    if (captureText.length > maxTypedCaptureLength) {
      errors.push(`Server gateway typed capture may include at most ${maxTypedCaptureLength} characters.`);
    }
  }

  return {
    valid: errors.length === 0,
    validationState: errors.length === 0 ? "accepted" : "rejected",
    errors,
    request: errors.length === 0 ? (value as ServerGatewayRequestEnvelope) : undefined,
  };
}

export function isValidServerGatewayRequest(value: unknown): value is ServerGatewayRequestEnvelope {
  return validateServerGatewayRequest(value).valid;
}

export function createServerGatewayFallbackEnvelope(
  reason: ServerGatewayFallbackReason,
  input?: {
    requestLike?: unknown;
    typedCaptureText?: string;
  },
): ServerGatewayFallbackEnvelope {
  const requestLike = input?.requestLike;
  const typedCaptureText = input?.typedCaptureText ?? extractServerGatewayTypedCaptureText(requestLike);
  const requestId =
    isRecord(requestLike) && isRecord(requestLike.contextPacket) && typeof requestLike.contextPacket.requestId === "string"
      ? requestLike.contextPacket.requestId
      : undefined;
  const copy = fallbackCopyByReason[reason];

  return {
    fallbackVersion: serverGatewayFallbackVersion,
    reason,
    label: copy.label,
    copy: copy.copy,
    requestId,
    typedCaptureText,
    preservesTypedCapture: true,
    deterministicLocalAvailable: true,
    automaticRetry: false,
    providerCallState: serverGatewayProviderCallState,
    networkCallState: serverGatewayNetworkCallState,
    externalActions: false,
    hiddenWrites: false,
  };
}

export function extractServerGatewayTypedCaptureText(value: unknown): string {
  if (!isRecord(value) || !isRecord(value.contextPacket) || !Array.isArray(value.contextPacket.sources)) {
    return "";
  }

  const typedCapture = value.contextPacket.sources.find(
    (source) => isRecord(source) && source.sourceType === "typed-capture" && typeof source.text === "string",
  );

  return isRecord(typedCapture) && typeof typedCapture.text === "string" ? typedCapture.text : "";
}
