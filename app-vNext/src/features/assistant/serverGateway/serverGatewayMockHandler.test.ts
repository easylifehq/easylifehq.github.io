import { assistantModelOutputVersion } from "../modelContracts/modelOutputTypes";
import {
  createServerGatewayTypedCaptureRequest,
  serverGatewayNetworkCallState,
  serverGatewayProviderCallState,
} from "./serverGatewayTypes";
import { runServerGatewayMockHandler } from "./serverGatewayMockHandler";

const validRequest = createServerGatewayTypedCaptureRequest({
  requestId: "stage-24-server-adapter-handler-proof",
  typedCaptureText: "Draft a task to follow up after the proposal review",
  includeDemoFixture: true,
});

const invalidRequest = {
  ...validRequest,
  promptId: "today-context-read",
};

const timeoutResponse = runServerGatewayMockHandler(validRequest, {
  forceFallbackReason: "timeout",
});

const invalidResponse = runServerGatewayMockHandler(invalidRequest);

const acceptedResponse = runServerGatewayMockHandler(validRequest);

const rejectedOutputResponse = runServerGatewayMockHandler(validRequest, {
  syntheticOutputOverride: {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Unsafe autosave output",
    summary: "I saved this task automatically and scheduled a reminder.",
    sources: [
      {
        sourceId: "capture-1",
        sourceLabel: "Typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Unsafe autosave output",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Final confirmation required",
      copy: "Review before saving.",
    },
    warnings: [],
  },
});

export const serverGatewayMockHandlerProof = [
  {
    name: "accepted request delegates to Stage 22 mock output",
    passed:
      acceptedResponse.status === "ok" &&
      acceptedResponse.requestValidationState === "accepted" &&
      acceptedResponse.outputValidationState === "accepted" &&
      acceptedResponse.output?.promptId === "intake-suggestion",
  },
  {
    name: "invalid Stage 24 request does not reach mock output",
    passed:
      invalidResponse.status === "fallback" &&
      invalidResponse.requestValidationState === "rejected" &&
      invalidResponse.fallback?.reason === "invalid-request",
  },
  {
    name: "timeout fallback preserves typed capture",
    passed:
      timeoutResponse.status === "fallback" &&
      timeoutResponse.fallback?.reason === "timeout" &&
      timeoutResponse.fallback.typedCaptureText === validRequest.contextPacket.sources.find(
        (source) => source.sourceType === "typed-capture",
      )?.text &&
      timeoutResponse.fallback.automaticRetry === false,
  },
  {
    name: "unsafe synthetic output becomes validation fallback",
    passed:
      rejectedOutputResponse.status === "fallback" &&
      rejectedOutputResponse.outputValidationState === "rejected" &&
      rejectedOutputResponse.fallback?.reason === "validation-rejected",
  },
  {
    name: "handler never claims provider, network, hidden write, or external action",
    passed: [acceptedResponse, timeoutResponse, invalidResponse, rejectedOutputResponse].every(
      (response) =>
        response.providerCallState === serverGatewayProviderCallState &&
        response.networkCallState === serverGatewayNetworkCallState &&
        response.externalActions === false &&
        response.hiddenWrites === false,
    ),
  },
];

export const serverGatewayMockHandlerProofPassed = serverGatewayMockHandlerProof.every(
  (example) => example.passed,
);
