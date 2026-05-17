import type { AssistantContextSourceType } from "../modelContracts/contextPacket";
import {
  serverGatewayExpectedOutputSchemaName,
  validateServerGatewayRequest,
  type ServerGatewayRequestEnvelope,
} from "./serverGatewayTypes";
import { liveAiAllowedPromptId, liveAiAllowedRoutePath } from "./liveAiEnvironment";

export const providerRequestSanitizerVersion =
  "stage-30-provider-request-sanitizer-v1" as const;

export const providerSanitizedRequestVersion =
  "stage-30-provider-sanitized-request-v1" as const;

export const providerRequestSanitizerAllowedSourceTypes = [
  "current-route",
  "typed-capture",
  "demo-fixture",
] as const satisfies AssistantContextSourceType[];

export const providerRequestSanitizerAllowedTypedCaptureLabels = [
  "Synthetic typed capture",
  "Private alpha typed capture",
] as const;

export type ProviderRequestSanitizerInputClass =
  | "synthetic-demo"
  | "private-alpha-typed-capture";

export type ProviderSanitizedSourceLabel = {
  sourceType: (typeof providerRequestSanitizerAllowedSourceTypes)[number];
  sourceLabel: string;
};

export type ProviderSanitizedRequestSummary = {
  version: typeof providerSanitizedRequestVersion;
  requestId: string;
  route: typeof liveAiAllowedRoutePath;
  promptId: typeof liveAiAllowedPromptId;
  expectedOutputSchemaName: typeof serverGatewayExpectedOutputSchemaName;
  inputClass: ProviderRequestSanitizerInputClass;
  typedCaptureText: string;
  typedCaptureCharacterCount: number;
  typedCaptureWordCount: number;
  sourceLabels: ProviderSanitizedSourceLabel[];
  readPolicy: "minimum-needed-only";
  confirmationPolicy: "suggestions-only";
  removedContext: string[];
  safeForProviderDryRun: true;
};

export type ProviderRequestSanitizerResult = {
  version: typeof providerRequestSanitizerVersion;
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary?: ProviderSanitizedRequestSummary;
};

const maxProviderTypedCaptureLength = 500;

const forbiddenRequestKeyPatterns = [
  /api[-_]?key/i,
  /auth/i,
  /calendar/i,
  /contact/i,
  /cookie/i,
  /credential/i,
  /database/i,
  /email/i,
  /firebase/i,
  /full[-_]?context/i,
  /geo/i,
  /latitude/i,
  /longitude/i,
  /note[-_]?body/i,
  /notes/i,
  /password/i,
  /phone/i,
  /raw[-_]?payload/i,
  /secret/i,
  /session/i,
  /street[-_]?address/i,
  /task[-_]?list/i,
  /tasks/i,
  /token/i,
];

const forbiddenCaptureContentPatterns = [
  {
    label: "secret-like text",
    pattern: /\b(?:api[-_ ]?key|password|secret|token|session)\b/i,
  },
  {
    label: "OpenAI-style secret pattern",
    pattern: /\bsk-[A-Za-z0-9_-]{8,}\b/,
  },
  {
    label: "Google-key-shaped secret pattern",
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/,
  },
  {
    label: "email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    label: "phone number",
    pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  },
  {
    label: "exact street address",
    pattern:
      /\b\d{2,6}\s+[A-Za-z0-9.' -]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl)\b/i,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedSourceType(value: unknown): value is ProviderSanitizedSourceLabel["sourceType"] {
  return (
    typeof value === "string" &&
    providerRequestSanitizerAllowedSourceTypes.includes(
      value as ProviderSanitizedSourceLabel["sourceType"],
    )
  );
}

function findForbiddenRequestKeys(value: unknown, path = "request"): string[] {
  if (!isRecord(value) && !Array.isArray(value)) return [];

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findForbiddenRequestKeys(entry, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, entryValue]) => {
    const nextPath = `${path}.${key}`;
    const keyErrors = forbiddenRequestKeyPatterns.some((pattern) => pattern.test(key))
      ? [nextPath]
      : [];

    return [...keyErrors, ...findForbiddenRequestKeys(entryValue, nextPath)];
  });
}

function captureContentErrors(text: string): string[] {
  return forbiddenCaptureContentPatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => `Typed capture includes forbidden ${label}.`);
}

function typedCaptureWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getSources(request: ServerGatewayRequestEnvelope) {
  return request.contextPacket.sources;
}

function getTypedCapture(request: ServerGatewayRequestEnvelope) {
  return getSources(request).find((source) => source.sourceType === "typed-capture");
}

function getInputClass(request: ServerGatewayRequestEnvelope): ProviderRequestSanitizerInputClass | undefined {
  const sources = getSources(request);
  const typedCapture = getTypedCapture(request);
  const hasDemoFixture = sources.some((source) => source.sourceType === "demo-fixture");

  if (typedCapture?.sourceLabel === "Synthetic typed capture" && hasDemoFixture) {
    return "synthetic-demo";
  }

  if (typedCapture?.sourceLabel === "Private alpha typed capture" && !hasDemoFixture) {
    return "private-alpha-typed-capture";
  }

  return undefined;
}

function sanitizedSourceLabels(request: ServerGatewayRequestEnvelope): ProviderSanitizedSourceLabel[] {
  return getSources(request)
    .filter((source) => isAllowedSourceType(source.sourceType))
    .map((source) => ({
      sourceType: source.sourceType as ProviderSanitizedSourceLabel["sourceType"],
      sourceLabel: source.sourceLabel,
    }));
}

export function sanitizeProviderDryRunRequest(value: unknown): ProviderRequestSanitizerResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requestValidation = validateServerGatewayRequest(value);

  if (!requestValidation.valid || !requestValidation.request) {
    errors.push(...requestValidation.errors);
    return {
      version: providerRequestSanitizerVersion,
      valid: false,
      errors,
      warnings,
    };
  }

  const request = requestValidation.request;
  const contextPacket = request.contextPacket;
  const sources = getSources(request);
  const typedCapture = getTypedCapture(request);
  const inputClass = getInputClass(request);
  const forbiddenKeyPaths = findForbiddenRequestKeys(value);

  if (request.promptId !== liveAiAllowedPromptId) {
    errors.push(`Provider dry-run allows only prompt ${liveAiAllowedPromptId}.`);
  }

  if (contextPacket.route.path !== liveAiAllowedRoutePath) {
    errors.push(`Provider dry-run allows only route ${liveAiAllowedRoutePath}.`);
  }

  if (contextPacket.readPolicy !== "minimum-needed-only") {
    errors.push("Provider dry-run requires minimum-needed-only read policy.");
  }

  if (contextPacket.confirmationPolicy !== "suggestions-only") {
    errors.push("Provider dry-run requires suggestions-only confirmation policy.");
  }

  sources.forEach((source, index) => {
    if (!isAllowedSourceType(source.sourceType)) {
      errors.push(
        `Provider dry-run source ${index + 1} uses forbidden source type: ${source.sourceType}.`,
      );
    }
  });

  if (!typedCapture) {
    errors.push("Provider dry-run requires one typed-capture source.");
  } else if (
    !providerRequestSanitizerAllowedTypedCaptureLabels.includes(
      typedCapture.sourceLabel as (typeof providerRequestSanitizerAllowedTypedCaptureLabels)[number],
    )
  ) {
    errors.push("Provider dry-run typed capture must be synthetic or private-alpha approved.");
  }

  if (!inputClass) {
    errors.push("Provider dry-run requires either synthetic demo capture or private-alpha typed capture.");
  }

  if (forbiddenKeyPaths.length) {
    errors.push(`Provider dry-run request includes forbidden private-context key(s): ${forbiddenKeyPaths.join(", ")}.`);
  }

  const typedCaptureText = typedCapture?.text.trim() ?? "";

  if (!typedCaptureText) {
    errors.push("Provider dry-run typed capture must not be empty.");
  }

  if (typedCaptureText.length > maxProviderTypedCaptureLength) {
    errors.push(`Provider dry-run typed capture may include at most ${maxProviderTypedCaptureLength} characters.`);
  }

  errors.push(...captureContentErrors(typedCaptureText));

  if (errors.length) {
    return {
      version: providerRequestSanitizerVersion,
      valid: false,
      errors,
      warnings,
    };
  }

  return {
    version: providerRequestSanitizerVersion,
    valid: true,
    errors,
    warnings,
    summary: {
      version: providerSanitizedRequestVersion,
      requestId: contextPacket.requestId,
      route: liveAiAllowedRoutePath,
      promptId: liveAiAllowedPromptId,
      expectedOutputSchemaName: serverGatewayExpectedOutputSchemaName,
      inputClass: inputClass ?? "synthetic-demo",
      typedCaptureText,
      typedCaptureCharacterCount: typedCaptureText.length,
      typedCaptureWordCount: typedCaptureWordCount(typedCaptureText),
      sourceLabels: sanitizedSourceLabels(request),
      readPolicy: "minimum-needed-only",
      confirmationPolicy: "suggestions-only",
      removedContext: [
        "raw context packet envelope",
        "current route object details beyond route path and source label",
        "demo fixture description beyond source label",
        "all unsupported app source types",
      ],
      safeForProviderDryRun: true,
    },
  };
}
