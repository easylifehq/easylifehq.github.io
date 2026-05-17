import { assistantModelOutputVersion, type AssistantModelSuggestionOutput } from "../modelContracts/modelOutputTypes";
import { runServerGatewayLiveDryRun } from "./serverGatewayLiveDryRun";
import { createServerGatewayLiveDryRunTypedCaptureRequest } from "./serverGatewayLiveDryRunTypes";

const typedCaptureText = "Draft a task to review the pilot notes.";

const validLiveValidationRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-26-live-validation-proof",
  typedCaptureText,
});

const serverProviderConfig = {
  enabled: true,
  runtime: "server",
  providerConfigured: true,
} as const;

function outputFactory(overrides?: Partial<AssistantModelSuggestionOutput>): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Review pilot notes",
    summary: "Review this task draft before any app data changes.",
    sources: [
      {
        sourceId: "stage-26-live-validation-proof-capture",
        sourceLabel: "Synthetic typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Review pilot notes",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Review only",
      copy: "Check the draft before using an existing manual path.",
    },
    warnings: [],
    ...overrides,
  };
}

const acceptedOutput = outputFactory();

const hiddenActionOutput = outputFactory({
  title: "Hidden action claim",
  summary: "I saved this task automatically and scheduled a reminder.",
  fields: [
    {
      label: "Task title",
      value: "I saved this task automatically.",
      editable: true,
    },
  ],
});

const externalActionOutput = outputFactory({
  intent: "follow-up",
  state: "preview",
  destinationLabel: "Follow-up preview only",
  title: "External action claim",
  summary: "Email sent to the contact from this suggestion.",
  fields: [
    {
      label: "Follow-up draft",
      value: "Email sent to the contact.",
      editable: true,
    },
  ],
});

const actionLikeWordingOutput = outputFactory({
  title: "Action-like wording",
  summary: "This task is ready to save after review.",
  fields: [
    {
      label: "Task title",
      value: "This task is ready to save after review.",
      editable: true,
    },
  ],
});

const malformedOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "task",
};

const invalidPromptRequest = {
  ...validLiveValidationRequest,
  promptId: "today-context-read",
};

function metadataLogText(value: unknown): string {
  return JSON.stringify(value);
}

export async function serverGatewayLiveValidationProof() {
  let acceptedProviderCallCount = 0;
  let hiddenActionProviderCallCount = 0;
  let externalActionProviderCallCount = 0;
  let downgradedProviderCallCount = 0;
  let validationRejectedProviderCallCount = 0;

  const acceptedResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      acceptedProviderCallCount += 1;
      return acceptedOutput;
    },
  });

  const hiddenActionResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      hiddenActionProviderCallCount += 1;
      return hiddenActionOutput;
    },
  });

  const externalActionResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      externalActionProviderCallCount += 1;
      return externalActionOutput;
    },
  });

  const downgradedResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      downgradedProviderCallCount += 1;
      return actionLikeWordingOutput;
    },
  });

  const timeoutResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: {
      ...serverProviderConfig,
      timeout: true,
    },
    serverOnlyProviderExecutor: () => {
      throw new Error("Timeout paths must short-circuit before provider execution.");
    },
  });

  const disabledResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: {
      ...serverProviderConfig,
      enabled: false,
    },
    serverOnlyProviderExecutor: () => {
      throw new Error("Disabled paths must short-circuit before provider execution.");
    },
  });

  const invalidRequestResponse = await runServerGatewayLiveDryRun(invalidPromptRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      throw new Error("Invalid requests must not reach provider execution.");
    },
  });

  const validationRejectedResponse = await runServerGatewayLiveDryRun(validLiveValidationRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      validationRejectedProviderCallCount += 1;
      return malformedOutput;
    },
  });

  const metadataLogs = [
    acceptedResponse.metadataLog,
    hiddenActionResponse.metadataLog,
    externalActionResponse.metadataLog,
    downgradedResponse.metadataLog,
    timeoutResponse.metadataLog,
    disabledResponse.metadataLog,
    invalidRequestResponse.metadataLog,
    validationRejectedResponse.metadataLog,
  ];

  const fallbackResponses = [
    hiddenActionResponse,
    externalActionResponse,
    timeoutResponse,
    disabledResponse,
    invalidRequestResponse,
    validationRejectedResponse,
  ];

  return [
    {
      name: "accepted output can render only after Stage 20 validation accepts it",
      passed:
        acceptedResponse.status === "ok" &&
        acceptedResponse.outputValidationState === "accepted" &&
        acceptedResponse.output?.promptId === "intake-suggestion" &&
        acceptedResponse.providerCallState === "called-by-server-executor" &&
        acceptedProviderCallCount === 1,
    },
    {
      name: "hidden-action provider-style output is rejected before render",
      passed:
        hiddenActionResponse.status === "fallback" &&
        hiddenActionResponse.fallback?.reason === "validation-rejected" &&
        hiddenActionResponse.outputValidationState === "rejected" &&
        hiddenActionResponse.output === undefined &&
        hiddenActionProviderCallCount === 1,
    },
    {
      name: "external-action provider-style output is rejected before render",
      passed:
        externalActionResponse.status === "fallback" &&
        externalActionResponse.fallback?.reason === "validation-rejected" &&
        externalActionResponse.outputValidationState === "rejected" &&
        externalActionResponse.output === undefined &&
        externalActionProviderCallCount === 1,
    },
    {
      name: "action-like wording is downgraded to needs-review instead of trusted as final",
      passed:
        downgradedResponse.status === "ok" &&
        downgradedResponse.outputValidationState === "downgraded" &&
        downgradedResponse.output?.state === "needs-review" &&
        downgradedResponse.output.destinationLabel === "Needs review" &&
        downgradedProviderCallCount === 1,
    },
    {
      name: "timeout fallback short-circuits without automatic retry",
      passed:
        timeoutResponse.status === "fallback" &&
        timeoutResponse.fallback?.reason === "timeout" &&
        timeoutResponse.fallback.automaticRetry === false &&
        timeoutResponse.metadataLog.providerCallAttempted === false,
    },
    {
      name: "disabled fallback stays local and avoids provider execution",
      passed:
        disabledResponse.status === "fallback" &&
        disabledResponse.fallback?.reason === "ai-disabled" &&
        disabledResponse.fallback.automaticRetry === false &&
        disabledResponse.providerCallState === "not-called",
    },
    {
      name: "invalid request fallback blocks provider execution",
      passed:
        invalidRequestResponse.status === "fallback" &&
        invalidRequestResponse.requestValidationState === "rejected" &&
        invalidRequestResponse.fallback?.reason === "invalid-request" &&
        invalidRequestResponse.providerCallState === "not-called",
    },
    {
      name: "validation-rejected fallback preserves typed capture locally",
      passed:
        validationRejectedResponse.status === "fallback" &&
        validationRejectedResponse.fallback?.reason === "validation-rejected" &&
        validationRejectedResponse.fallback.preservesTypedCapture === true &&
        validationRejectedProviderCallCount === 1,
    },
    {
      name: "all fallback paths disable automatic retry",
      passed: fallbackResponses.every((response) => response.fallback?.automaticRetry === false),
    },
    {
      name: "metadata logs do not include raw typed capture by default",
      passed: metadataLogs.every((metadataLog) => !metadataLogText(metadataLog).includes(typedCaptureText)),
    },
    {
      name: "all responses avoid hidden writes and external actions",
      passed: [
        acceptedResponse,
        hiddenActionResponse,
        externalActionResponse,
        downgradedResponse,
        timeoutResponse,
        disabledResponse,
        invalidRequestResponse,
        validationRejectedResponse,
      ].every((response) => response.hiddenWrites === false && response.externalActions === false),
    },
  ];
}

export const serverGatewayLiveValidationProofAnchors = {
  route: validLiveValidationRequest.contextPacket.route.path,
  promptId: validLiveValidationRequest.promptId,
  contextVersion: validLiveValidationRequest.contextPacket.version,
  requestSourceTypes: validLiveValidationRequest.contextPacket.sources.map((source) => source.sourceType),
  typedCaptureLoggingRule: "metadata-only; raw typed capture excluded from metadataLog",
};
