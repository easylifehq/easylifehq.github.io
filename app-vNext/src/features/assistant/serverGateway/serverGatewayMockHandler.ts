import {
  runMockGateway,
  type MockGatewayForcedFallbackReason,
  type MockGatewayRunOptions,
} from "../gateway/mockGateway";
import {
  mockGatewayAllowedPromptId,
  mockGatewayAllowedSurface,
  mockGatewayRequestVersion,
  type MockGatewayRequestEnvelope,
} from "../gateway/mockGatewayTypes";
import {
  createServerGatewayFallbackEnvelope,
  serverGatewayNetworkCallState,
  serverGatewayProviderCallState,
  serverGatewayResponseVersion,
  validateServerGatewayRequest,
  type ServerGatewayFallbackReason,
  type ServerGatewayRequestEnvelope,
  type ServerGatewayResponseEnvelope,
} from "./serverGatewayTypes";

export type ServerGatewayMockHandlerOptions = {
  forceFallbackReason?: MockGatewayForcedFallbackReason;
  syntheticOutputOverride?: MockGatewayRunOptions["syntheticOutputOverride"];
};

function toMockGatewayRequest(request: ServerGatewayRequestEnvelope): MockGatewayRequestEnvelope {
  return {
    requestVersion: mockGatewayRequestVersion,
    promptId: mockGatewayAllowedPromptId,
    surface: mockGatewayAllowedSurface,
    contextPacket: request.contextPacket,
  };
}

function toServerFallbackReason(reason: string): ServerGatewayFallbackReason {
  if (
    reason === "timeout" ||
    reason === "rate-limit" ||
    reason === "circuit-open" ||
    reason === "ai-disabled" ||
    reason === "invalid-request" ||
    reason === "validation-rejected"
  ) {
    return reason;
  }

  return "validation-rejected";
}

export function runServerGatewayMockHandler(
  value: unknown,
  options: ServerGatewayMockHandlerOptions = {},
): ServerGatewayResponseEnvelope {
  const requestValidation = validateServerGatewayRequest(value);

  if (!requestValidation.valid || !requestValidation.request) {
    return {
      responseVersion: serverGatewayResponseVersion,
      status: "fallback",
      requestValidationState: "rejected",
      fallback: createServerGatewayFallbackEnvelope("invalid-request", { requestLike: value }),
      errors: requestValidation.errors,
      warnings: [],
      providerCallState: serverGatewayProviderCallState,
      networkCallState: serverGatewayNetworkCallState,
      externalActions: false,
      hiddenWrites: false,
    };
  }

  const mockRequest = toMockGatewayRequest(requestValidation.request);
  const mockResult = runMockGateway(mockRequest, options);

  if (mockResult.status === "mock-output") {
    return {
      responseVersion: serverGatewayResponseVersion,
      requestId: requestValidation.request.contextPacket.requestId,
      status: "ok",
      requestValidationState: "accepted",
      outputValidationState: mockResult.response.safetyState,
      output: mockResult.response.output,
      errors: mockResult.response.errors,
      warnings: mockResult.response.warnings,
      providerCallState: serverGatewayProviderCallState,
      networkCallState: serverGatewayNetworkCallState,
      externalActions: false,
      hiddenWrites: false,
    };
  }

  const fallbackReason = toServerFallbackReason(mockResult.fallback.reason);

  return {
    responseVersion: serverGatewayResponseVersion,
    requestId: requestValidation.request.contextPacket.requestId,
    status: "fallback",
    requestValidationState: "accepted",
    outputValidationState: mockResult.response?.safetyState ?? "rejected",
    fallback: createServerGatewayFallbackEnvelope(fallbackReason, {
      requestLike: requestValidation.request,
      typedCaptureText: mockResult.fallback.typedCaptureText,
    }),
    errors: [...mockResult.errors, ...(mockResult.response?.errors ?? [])],
    warnings: mockResult.response?.warnings ?? [],
    providerCallState: serverGatewayProviderCallState,
    networkCallState: serverGatewayNetworkCallState,
    externalActions: false,
    hiddenWrites: false,
  };
}
