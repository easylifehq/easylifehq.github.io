import {
  createAssistantContextPacket,
  type AssistantContextSource,
} from "../modelContracts/contextPacket";
import { assistantModelOutputVersion } from "../modelContracts/modelOutputTypes";
import { runServerGatewayMockHandler } from "./serverGatewayMockHandler";
import {
  createServerGatewayTypedCaptureRequest,
  serverGatewayNetworkCallState,
  serverGatewayProviderCallState,
} from "./serverGatewayTypes";

const safeRequest = createServerGatewayTypedCaptureRequest({
  requestId: "stage-24-safety-safe-request",
  typedCaptureText: "Draft a task to follow up after the budget review",
  includeDemoFixture: true,
});

const broadSources: AssistantContextSource[] = [
  {
    id: "capture-1",
    sourceType: "typed-capture",
    sourceLabel: "Typed capture",
    text: "Draft a task from visible capture only.",
    state: "draft",
  },
  {
    id: "note-1",
    sourceType: "selected-note-context",
    sourceLabel: "Saved context",
    title: "Too much context",
    excerpt: "The first server adapter must not read note bodies.",
  },
];

const broadContextRequest = {
  ...safeRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-24-safety-broad-context",
    route: {
      routeId: "inbox",
      routeLabel: "Inbox",
      path: "/app/easylist/add",
    },
    sources: broadSources,
  }),
};

const unsupportedPromptRequest = {
  ...safeRequest,
  promptId: "today-context-read",
};

const externalActionOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "follow-up",
  confidence: "medium",
  state: "preview",
  destinationLabel: "Follow-up preview only",
  title: "External action claim",
  summary: "Email sent and a calendar event created for this follow-up.",
  sources: [
    {
      sourceId: "capture-1",
      sourceLabel: "Typed capture",
    },
  ],
  fields: [
    {
      label: "Follow-up draft",
      value: "Email sent and a calendar event created.",
      editable: true,
    },
  ],
  confirmation: {
    required: true,
    label: "Review only",
    copy: "Review before choosing any manual path.",
  },
  warnings: [],
};

const actionLikeOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "task",
  confidence: "medium",
  state: "draft",
  destinationLabel: "Inbox task draft",
  title: "Action-like wording",
  summary: "This task is ready to save after review.",
  sources: [
    {
      sourceId: "capture-1",
      sourceLabel: "Typed capture",
    },
  ],
  fields: [
    {
      label: "Task title",
      value: "This task is ready to save after review.",
      editable: true,
    },
  ],
  confirmation: {
    required: true,
    label: "Final confirmation required",
    copy: "Review the task draft before using the existing task save path.",
  },
  warnings: [],
};

const acceptedResponse = runServerGatewayMockHandler(safeRequest);
const broadContextResponse = runServerGatewayMockHandler(broadContextRequest);
const unsupportedPromptResponse = runServerGatewayMockHandler(unsupportedPromptRequest);
const externalActionResponse = runServerGatewayMockHandler(safeRequest, {
  syntheticOutputOverride: externalActionOutput,
});
const downgradedResponse = runServerGatewayMockHandler(safeRequest, {
  syntheticOutputOverride: actionLikeOutput,
});
const timeoutResponse = runServerGatewayMockHandler(safeRequest, {
  forceFallbackReason: "timeout",
});
const disabledResponse = runServerGatewayMockHandler(safeRequest, {
  forceFallbackReason: "ai-disabled",
});
const validationRejectedResponse = externalActionResponse;

const safetyResponses = [
  acceptedResponse,
  broadContextResponse,
  unsupportedPromptResponse,
  externalActionResponse,
  downgradedResponse,
  timeoutResponse,
  disabledResponse,
  validationRejectedResponse,
];

export const serverGatewaySafetyProof = [
  {
    name: "accepted bounded Inbox typed-capture request",
    passed:
      acceptedResponse.status === "ok" &&
      acceptedResponse.requestValidationState === "accepted" &&
      acceptedResponse.output?.promptId === "intake-suggestion",
  },
  {
    name: "rejected broad context request",
    passed:
      broadContextResponse.status === "fallback" &&
      broadContextResponse.requestValidationState === "rejected" &&
      broadContextResponse.errors.some((error) => error.includes("forbidden source type")),
  },
  {
    name: "rejected unsupported prompt request",
    passed:
      unsupportedPromptResponse.status === "fallback" &&
      unsupportedPromptResponse.requestValidationState === "rejected" &&
      unsupportedPromptResponse.errors.some((error) => error.includes("allows only intake-suggestion")),
  },
  {
    name: "rejected external action claims",
    passed:
      externalActionResponse.status === "fallback" &&
      externalActionResponse.outputValidationState === "rejected" &&
      externalActionResponse.errors.some((error) => error.includes("forbidden hidden-action or external-action")),
  },
  {
    name: "downgraded action-like wording",
    passed:
      downgradedResponse.status === "ok" &&
      downgradedResponse.outputValidationState === "downgraded" &&
      downgradedResponse.output?.state === "needs-review" &&
      downgradedResponse.output.destinationLabel === "Needs review",
  },
  {
    name: "timeout fallback preserves capture and disables retry",
    passed:
      timeoutResponse.status === "fallback" &&
      timeoutResponse.fallback?.reason === "timeout" &&
      timeoutResponse.fallback.typedCaptureText === safeRequest.contextPacket.sources.find(
        (source) => source.sourceType === "typed-capture",
      )?.text &&
      timeoutResponse.fallback.automaticRetry === false,
  },
  {
    name: "AI-disabled fallback preserves capture and local path",
    passed:
      disabledResponse.status === "fallback" &&
      disabledResponse.fallback?.reason === "ai-disabled" &&
      disabledResponse.fallback.preservesTypedCapture === true &&
      disabledResponse.fallback.deterministicLocalAvailable === true,
  },
  {
    name: "validation-rejected fallback stays local",
    passed:
      validationRejectedResponse.status === "fallback" &&
      validationRejectedResponse.fallback?.reason === "validation-rejected" &&
      validationRejectedResponse.fallback.preservesTypedCapture === true,
  },
  {
    name: "all safety cases avoid provider, network, hidden writes, and external actions",
    passed: safetyResponses.every(
      (response) =>
        response.providerCallState === serverGatewayProviderCallState &&
        response.networkCallState === serverGatewayNetworkCallState &&
        response.hiddenWrites === false &&
        response.externalActions === false,
    ),
  },
];

export const serverGatewaySafetyProofPassed = serverGatewaySafetyProof.every((example) => example.passed);

export const serverGatewaySafetySummary = {
  accepted: acceptedResponse.status,
  broadContext: broadContextResponse.requestValidationState,
  unsupportedPrompt: unsupportedPromptResponse.requestValidationState,
  externalAction: externalActionResponse.outputValidationState,
  downgradedActionLike: downgradedResponse.outputValidationState,
  timeout: timeoutResponse.fallback?.reason,
  disabled: disabledResponse.fallback?.reason,
  validationRejected: validationRejectedResponse.fallback?.reason,
};
