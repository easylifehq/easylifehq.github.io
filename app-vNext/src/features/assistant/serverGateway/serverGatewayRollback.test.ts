import { assistantModelOutputVersion } from "../modelContracts/modelOutputTypes";
import { runServerGatewayLiveDryRun } from "./serverGatewayLiveDryRun";
import {
  createServerGatewayLiveDryRunTypedCaptureRequest,
  type ServerGatewayLiveDryRunResponseEnvelope,
} from "./serverGatewayLiveDryRunTypes";

const rollbackTypedCapture = "Draft a safe follow-up task from this capture.";

const rollbackRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-29-rollback-proof",
  typedCaptureText: rollbackTypedCapture,
});

const serverProviderConfig = {
  enabled: true,
  runtime: "server",
  providerConfigured: true,
} as const;

const malformedProviderOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "task",
};

function fallbackPreservesCapture(response: ServerGatewayLiveDryRunResponseEnvelope): boolean {
  return (
    response.status === "fallback" &&
    response.fallback?.typedCaptureText === rollbackTypedCapture &&
    response.fallback.preservesTypedCapture === true
  );
}

function fallbackStaysManual(response: ServerGatewayLiveDryRunResponseEnvelope): boolean {
  return (
    response.status === "fallback" &&
    response.fallback?.automaticRetry === false &&
    response.fallback.deterministicLocalAvailable === true &&
    response.hiddenWrites === false &&
    response.externalActions === false
  );
}

export async function serverGatewayRollbackProof() {
  let disabledProviderCallCount = 0;
  let circuitOpenProviderCallCount = 0;
  let rateLimitProviderCallCount = 0;
  let timeoutProviderCallCount = 0;
  let providerErrorCallCount = 0;
  let validationRejectedProviderCallCount = 0;

  const disabledResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: {
      ...serverProviderConfig,
      enabled: false,
    },
    serverOnlyProviderExecutor: () => {
      disabledProviderCallCount += 1;
      throw new Error("Disabled rollback path must not call provider executor.");
    },
  });

  const circuitOpenResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: {
      ...serverProviderConfig,
      killSwitchOpen: true,
    },
    serverOnlyProviderExecutor: () => {
      circuitOpenProviderCallCount += 1;
      throw new Error("Circuit-open rollback path must not call provider executor.");
    },
  });

  const rateLimitResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: {
      ...serverProviderConfig,
      rateLimited: true,
    },
    serverOnlyProviderExecutor: () => {
      rateLimitProviderCallCount += 1;
      throw new Error("Rate-limited rollback path must not call provider executor.");
    },
  });

  const timeoutResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: {
      ...serverProviderConfig,
      timeout: true,
    },
    serverOnlyProviderExecutor: () => {
      timeoutProviderCallCount += 1;
      throw new Error("Timeout rollback path must not call provider executor.");
    },
  });

  const providerErrorResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      providerErrorCallCount += 1;
      throw new Error("Synthetic provider failure for rollback proof.");
    },
  });

  const validationRejectedResponse = await runServerGatewayLiveDryRun(rollbackRequest, {
    config: serverProviderConfig,
    serverOnlyProviderExecutor: () => {
      validationRejectedProviderCallCount += 1;
      return malformedProviderOutput;
    },
  });

  const fallbackResponses = [
    disabledResponse,
    circuitOpenResponse,
    rateLimitResponse,
    timeoutResponse,
    providerErrorResponse,
    validationRejectedResponse,
  ];

  return [
    {
      name: "disabled state falls back without provider execution",
      passed:
        disabledResponse.fallback?.reason === "ai-disabled" &&
        disabledResponse.providerCallState === "not-called" &&
        disabledProviderCallCount === 0,
    },
    {
      name: "circuit-open kill switch falls back without provider execution",
      passed:
        circuitOpenResponse.fallback?.reason === "circuit-open" &&
        circuitOpenResponse.providerCallState === "not-called" &&
        circuitOpenProviderCallCount === 0,
    },
    {
      name: "rate-limit state falls back without provider execution",
      passed:
        rateLimitResponse.fallback?.reason === "rate-limit" &&
        rateLimitResponse.providerCallState === "not-called" &&
        rateLimitProviderCallCount === 0,
    },
    {
      name: "timeout state falls back without automatic retry",
      passed:
        timeoutResponse.fallback?.reason === "timeout" &&
        timeoutResponse.providerCallState === "not-called" &&
        timeoutProviderCallCount === 0 &&
        timeoutResponse.metadataLog.latencyBucket === "timed-out",
    },
    {
      name: "provider-error state falls back after one server executor attempt",
      passed:
        providerErrorResponse.fallback?.reason === "provider-error" &&
        providerErrorResponse.providerCallState === "called-by-server-executor" &&
        providerErrorCallCount === 1,
    },
    {
      name: "validation-rejected state falls back after unsafe output is blocked",
      passed:
        validationRejectedResponse.fallback?.reason === "validation-rejected" &&
        validationRejectedResponse.outputValidationState === "rejected" &&
        validationRejectedResponse.providerCallState === "called-by-server-executor" &&
        validationRejectedProviderCallCount === 1,
    },
    {
      name: "typed capture is preserved across every rollback state",
      passed: fallbackResponses.every(fallbackPreservesCapture),
    },
    {
      name: "every rollback state disables automatic retry and keeps local fallback available",
      passed: fallbackResponses.every(fallbackStaysManual),
    },
    {
      name: "provider is not called when disabled, circuit-open, or rate-limited",
      passed:
        disabledProviderCallCount === 0 &&
        circuitOpenProviderCallCount === 0 &&
        rateLimitProviderCallCount === 0,
    },
  ];
}

export const serverGatewayRollbackProofAnchors = {
  route: rollbackRequest.contextPacket.route.path,
  promptId: rollbackRequest.promptId,
  fallbackReasons: [
    "ai-disabled",
    "circuit-open",
    "rate-limit",
    "timeout",
    "provider-error",
    "validation-rejected",
  ],
  typedCapturePreserved: true,
  automaticRetryAllowed: false,
  deterministicLocalFallbackRequired: true,
  hiddenWritesAllowed: false,
  externalActionsAllowed: false,
};
