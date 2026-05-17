import { createMockGatewayTypedCaptureRequest } from "./mockGatewayRequest";
import { mockGatewayAcceptedResponseFixtures } from "./mockGatewayResponse";
import { createMockGatewayFallbackState, mockGatewayFallbackReasons } from "./mockGatewayFallbacks";
import { runMockGateway } from "./mockGateway";

const validCaptureText = "Draft the construction outreach task";

const validRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-fallback-valid",
  typedCaptureText: validCaptureText,
});

const invalidRequest = {
  ...validRequest,
  promptId: "today-context-read",
};

const rejectedSyntheticOutput = {
  ...mockGatewayAcceptedResponseFixtures.task,
  summary: "I automatically saved this task and sent an email.",
};

export const mockGatewayFallbackStateProof = mockGatewayFallbackReasons.map((reason) => {
  const fallback = createMockGatewayFallbackState(reason, {
    typedCaptureText: "Follow up with Jordan after the proposal review",
  });

  return {
    reason,
    fallback,
    passed:
      fallback.reason === reason &&
      fallback.preservesTypedCapture &&
      fallback.typedCaptureText === "Follow up with Jordan after the proposal review" &&
      fallback.deterministicLocalAvailable &&
      fallback.localSuggestion.intent === "follow-up" &&
      fallback.localDraft.draftType === "follow-up" &&
      fallback.retryPolicy.automaticRetry === false &&
      !fallback.hiddenReads &&
      !fallback.hiddenWrites &&
      !fallback.externalActions,
  };
});

export const mockGatewayForcedFallbackProof = [
  "timeout",
  "rate-limit",
  "circuit-open",
  "ai-disabled",
].map((reason) => {
  const result = runMockGateway(validRequest, {
    forceFallbackReason: reason as "timeout" | "rate-limit" | "circuit-open" | "ai-disabled",
  });

  return {
    reason,
    result,
    passed:
      result.status === "fallback" &&
      result.fallback.reason === reason &&
      result.fallback.typedCaptureText === validCaptureText &&
      result.fallback.retryPolicy.automaticRetry === false &&
      result.automaticRetry === false,
  };
});

export const mockGatewayInvalidRequestFallbackProof = (() => {
  const result = runMockGateway(invalidRequest);

  return {
    result,
    passed:
      result.status === "fallback" &&
      result.fallback.reason === "invalid-request" &&
      result.fallback.typedCaptureText === validCaptureText &&
      result.errors.length > 0 &&
      result.automaticRetry === false,
  };
})();

export const mockGatewayValidationRejectedFallbackProof = (() => {
  const result = runMockGateway(validRequest, {
    syntheticOutputOverride: rejectedSyntheticOutput,
  });

  return {
    result,
    passed:
      result.status === "fallback" &&
      result.fallback.reason === "validation-rejected" &&
      result.fallback.typedCaptureText === validCaptureText &&
      result.response?.status === "fallback" &&
      !result.response?.output &&
      result.automaticRetry === false,
  };
})();

export const mockGatewaySuccessProof = (() => {
  const result = runMockGateway(validRequest);

  return {
    result,
    passed:
      result.status === "mock-output" &&
      result.typedCaptureText === validCaptureText &&
      result.response.status === "ok" &&
      Boolean(result.response.output) &&
      result.automaticRetry === false,
  };
})();

export const mockGatewayProofPassed = [
  ...mockGatewayFallbackStateProof,
  ...mockGatewayForcedFallbackProof,
  mockGatewayInvalidRequestFallbackProof,
  mockGatewayValidationRejectedFallbackProof,
  mockGatewaySuccessProof,
].every((example) => example.passed);
