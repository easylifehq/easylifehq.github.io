import {
  assistantModelOutputVersion,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import { liveProviderSecretBoundaryPlaceholderName } from "./liveProviderSecretBoundary";
import {
  sanitizeProviderDryRunRequest,
  type ProviderSanitizedRequestSummary,
} from "./providerRequestSanitizer";
import {
  createServerGatewayTypedCaptureRequest,
  type ServerGatewayRequestEnvelope,
} from "./serverGatewayTypes";
import {
  firstLiveProviderCallCurrentApprovalVerdict,
  firstLiveProviderCallRequiredApprovalVerdict,
  isFirstLiveProviderServerResponseEnvelope,
  normalizeFirstLiveProviderServerResponse,
  runFirstLiveProviderCallHarness,
  validateFirstLiveProviderSanitizedSummary,
} from "./firstLiveProviderCallHarness";
import { liveAiAllowedRoutePath } from "./liveAiEnvironment";

function stage31Request(input?: {
  requestId?: string;
  typedCaptureText?: string;
  includeDemoFixture?: boolean;
}): ServerGatewayRequestEnvelope {
  const request = createServerGatewayTypedCaptureRequest({
    requestId: input?.requestId ?? "stage-31-first-live-call-proof",
    typedCaptureText: input?.typedCaptureText ?? "Draft a task to review the synthetic provider call notes.",
    includeDemoFixture: input?.includeDemoFixture ?? true,
  });

  request.contextPacket.route.path = liveAiAllowedRoutePath;
  request.contextPacket.sources = request.contextPacket.sources.map((source) => {
    if (source.sourceType === "current-route") {
      return {
        ...source,
        path: liveAiAllowedRoutePath,
      };
    }

    if (source.sourceType === "typed-capture") {
      return {
        ...source,
        sourceLabel: "Synthetic typed capture",
      };
    }

    return source;
  });

  return request;
}

function sanitizedSummary(): ProviderSanitizedRequestSummary {
  const result = sanitizeProviderDryRunRequest(stage31Request());

  if (!result.valid || !result.summary) {
    throw new Error("Stage 31 harness proof requires a valid sanitized summary fixture.");
  }

  return result.summary;
}

function acceptedOutput(overrides: Partial<AssistantModelSuggestionOutput> = {}): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Review synthetic provider call notes",
    summary: "Review this suggestion before choosing any save path.",
    sources: [
      {
        sourceId: "stage-31-first-live-call-proof-capture",
        sourceLabel: "Synthetic typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Review synthetic provider call notes",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Review only",
      copy: "Nothing is saved or sent.",
    },
    warnings: [],
    ...overrides,
  };
}

const summary = sanitizedSummary();
const invalidRawRequest = stage31Request();
const wrongRouteSummary = {
  ...summary,
  route: "/app/hq?demo=1",
};

export const firstLiveProviderCallHarnessValidationProof = [
  {
    name: "accepts sanitized Inbox typed-capture summary",
    validation: validateFirstLiveProviderSanitizedSummary(summary),
    expectedValid: true,
  },
  {
    name: "rejects raw server gateway request",
    validation: validateFirstLiveProviderSanitizedSummary(invalidRawRequest),
    expectedValid: false,
  },
  {
    name: "rejects sanitized summary with wrong route",
    validation: validateFirstLiveProviderSanitizedSummary(wrongRouteSummary),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const firstLiveProviderCallHarnessValidationProofPassed =
  firstLiveProviderCallHarnessValidationProof.every((example) => example.passed);

const acceptedServerFallbackEnvelope = {
  version: "stage-32-assistant-intake-response-v1",
  source: "assistantIntakeSuggestion",
  route: liveAiAllowedRoutePath,
  promptId: "intake-suggestion",
  status: "fallback",
  authState: "verified",
  requestValidationState: "accepted",
  providerState: "not-called",
  providerCallAttempted: false,
  fallbackState: "local-disabled",
  sanitizerState: "accepted",
  validationState: "not-run",
  quarantineState: "not-run",
  outputState: "fallback",
  suggestion: null,
  destination: "Inbox review",
  confidence: "needs-review",
  nothingSavedOrSent: true,
  requiresApproval: true,
  hiddenWrites: false,
  externalActions: false,
  savesCreated: false,
  messagesSent: false,
  calendarChanged: false,
  notificationsCreated: false,
  realMemoryCreated: false,
  rejectionReason: null,
  message: "The server gateway accepted this Inbox capture, but live AI is still disabled. Nothing was saved or sent.",
} as const;

export const firstLiveProviderServerResponseEnvelopeProof = [
  {
    name: "accepts Stage 32 server fallback envelope",
    passed: isFirstLiveProviderServerResponseEnvelope(acceptedServerFallbackEnvelope),
  },
  {
    name: "normalizes malformed server envelope into fallback",
    passed:
      normalizeFirstLiveProviderServerResponse({
        ...acceptedServerFallbackEnvelope,
        providerState: "called-by-server-executor",
        nothingSavedOrSent: false,
      }).rejectionReason === "invalid-server-response-envelope",
  },
  {
    name: "normalized malformed envelope remains no-action fallback",
    passed: (() => {
      const normalized = normalizeFirstLiveProviderServerResponse({ status: "saved" });
      return (
        normalized.providerState === "not-called" &&
        normalized.nothingSavedOrSent === true &&
        normalized.hiddenWrites === false &&
        normalized.externalActions === false &&
        normalized.suggestion === null
      );
    })(),
  },
];

export const firstLiveProviderServerResponseEnvelopeProofPassed =
  firstLiveProviderServerResponseEnvelopeProof.every((example) => example.passed);

export async function firstLiveProviderCallHarnessRuntimeProof() {
  let disabledCallCount = 0;
  let approvalMissingCallCount = 0;
  let unconfiguredCallCount = 0;
  let timeoutCallCount = 0;
  let acceptedCallCount = 0;
  let quarantinedCallCount = 0;
  let providerErrorCallCount = 0;

  const configuredSecretBoundary = {
    version: "stage-31-live-provider-secret-boundary-v1" as const,
    placeholderName: liveProviderSecretBoundaryPlaceholderName,
    runtime: "server" as const,
    serverReportsConfigured: true,
  };

  const unconfiguredSecretBoundary = {
    ...configuredSecretBoundary,
    serverReportsConfigured: false,
  };

  const disabledResponse = await runFirstLiveProviderCallHarness(summary, {
    serverOnlyProviderExecutor: () => {
      disabledCallCount += 1;
      return acceptedOutput();
    },
  });

  const approvalMissingResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallCurrentApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    serverOnlyProviderExecutor: () => {
      approvalMissingCallCount += 1;
      return acceptedOutput();
    },
  });

  const invalidResponse = await runFirstLiveProviderCallHarness(invalidRawRequest, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    serverOnlyProviderExecutor: () => acceptedOutput(),
  });

  const unconfiguredResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: unconfiguredSecretBoundary,
    serverOnlyProviderExecutor: () => {
      unconfiguredCallCount += 1;
      return acceptedOutput();
    },
  });

  const timeoutResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    timeout: true,
    serverOnlyProviderExecutor: () => {
      timeoutCallCount += 1;
      return acceptedOutput();
    },
  });

  const acceptedResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    serverOnlyProviderExecutor: (request) => {
      acceptedCallCount += 1;
      return acceptedOutput({
        sources: [
          {
            sourceId: request.sanitizedSummary.requestId,
            sourceLabel: "Synthetic typed capture",
          },
        ],
      });
    },
  });

  const quarantinedResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    serverOnlyProviderExecutor: () => {
      quarantinedCallCount += 1;
      return acceptedOutput({
        summary: "I saved this task automatically and sent an email.",
      });
    },
  });

  const providerErrorResponse = await runFirstLiveProviderCallHarness(summary, {
    enabled: true,
    approvalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
    secretBoundaryCheck: configuredSecretBoundary,
    serverOnlyProviderExecutor: () => {
      providerErrorCallCount += 1;
      throw new Error("Synthetic provider failure for harness proof.");
    },
  });

  const fallbackResponses = [
    disabledResponse,
    approvalMissingResponse,
    invalidResponse,
    unconfiguredResponse,
    timeoutResponse,
    quarantinedResponse,
    providerErrorResponse,
  ];

  return [
    {
      name: "disabled harness does not call provider executor",
      passed:
        disabledResponse.status === "fallback" &&
        disabledResponse.fallback?.reason === "disabled" &&
        disabledResponse.providerCallAttempted === false &&
        disabledCallCount === 0,
    },
    {
      name: "missing approval blocks live mode before provider executor",
      passed:
        approvalMissingResponse.status === "fallback" &&
        approvalMissingResponse.fallback?.reason === "approval-missing" &&
        approvalMissingResponse.providerCallAttempted === false &&
        approvalMissingCallCount === 0,
    },
    {
      name: "raw unsanitized request is rejected",
      passed:
        invalidResponse.status === "fallback" &&
        invalidResponse.fallback?.reason === "invalid-sanitized-request" &&
        invalidResponse.requestValidationState === "rejected",
    },
    {
      name: "unconfigured secret boundary preserves local fallback",
      passed:
        unconfiguredResponse.status === "fallback" &&
        unconfiguredResponse.fallback?.reason === "provider-unconfigured" &&
        unconfiguredResponse.secretBoundaryState === "server-secret-unconfigured" &&
        unconfiguredCallCount === 0,
    },
    {
      name: "timeout falls back without automatic retry",
      passed:
        timeoutResponse.status === "fallback" &&
        timeoutResponse.fallback?.reason === "timeout" &&
        timeoutResponse.fallback.automaticRetry === false &&
        timeoutCallCount === 0,
    },
    {
      name: "accepted provider-style output passes through quarantine",
      passed:
        acceptedResponse.status === "ok" &&
        acceptedResponse.quarantineState === "accepted" &&
        acceptedResponse.output?.promptId === "intake-suggestion" &&
        acceptedCallCount === 1,
    },
    {
      name: "hidden-write provider-style output is quarantined before render",
      passed:
        quarantinedResponse.status === "fallback" &&
        quarantinedResponse.fallback?.reason === "response-quarantined" &&
        quarantinedResponse.quarantineState === "quarantined" &&
        quarantinedResponse.quarantine?.renderableAsSuggestion === false &&
        quarantinedCallCount === 1,
    },
    {
      name: "provider error falls back after one executor attempt",
      passed:
        providerErrorResponse.status === "fallback" &&
        providerErrorResponse.fallback?.reason === "provider-error" &&
        providerErrorResponse.providerCallState === "called-by-server-executor" &&
        providerErrorCallCount === 1,
    },
    {
      name: "fallbacks preserve capture and never save or act externally",
      passed: fallbackResponses.every(
        (response) =>
          response.fallback?.preservesTypedCapture === true &&
          response.fallback.deterministicLocalAvailable === true &&
          response.hiddenWrites === false &&
          response.externalActions === false &&
          response.realMemory === false &&
          response.savedObjectExpansion === false,
      ),
    },
  ];
}

export const firstLiveProviderCallHarnessProofAnchors = {
  requiredApprovalVerdict: firstLiveProviderCallRequiredApprovalVerdict,
  currentApprovalVerdict: firstLiveProviderCallCurrentApprovalVerdict,
  route: summary.route,
  promptId: summary.promptId,
  inputClass: summary.inputClass,
  sourceTypes: summary.sourceLabels.map((source) => source.sourceType),
  secretPlaceholder: liveProviderSecretBoundaryPlaceholderName,
  providerCallAttemptedOnImport: false,
};
