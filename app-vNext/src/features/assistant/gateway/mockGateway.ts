import {
  createMockGatewayFallbackState,
  extractTypedCaptureTextFromMockGatewayInput,
  type MockGatewayFallbackReason,
  type MockGatewayFallbackState,
} from "./mockGatewayFallbacks";
import { validateMockGatewayRequest } from "./mockGatewayRequest";
import {
  createMockGatewayResponse,
  validateMockGatewaySyntheticOutput,
  type MockGatewayResponseEnvelope,
} from "./mockGatewayResponse";
import type { MockGatewayRequestEnvelope } from "./mockGatewayTypes";

export type MockGatewayForcedFallbackReason = Exclude<
  MockGatewayFallbackReason,
  "invalid-request" | "validation-rejected"
>;

export type MockGatewayRunOptions = {
  forceFallbackReason?: MockGatewayForcedFallbackReason;
  syntheticOutputOverride?: unknown;
};

export type MockGatewayResult =
  | {
      status: "mock-output";
      request: MockGatewayRequestEnvelope;
      response: MockGatewayResponseEnvelope;
      typedCaptureText: string;
      automaticRetry: false;
    }
  | {
      status: "fallback";
      fallback: MockGatewayFallbackState;
      response?: MockGatewayResponseEnvelope;
      errors: string[];
      automaticRetry: false;
    };

function fallbackResult(
  reason: MockGatewayFallbackReason,
  requestLike: unknown,
  errors: string[],
  response?: MockGatewayResponseEnvelope,
): MockGatewayResult {
  return {
    status: "fallback",
    fallback: createMockGatewayFallbackState(reason, { requestLike }),
    response,
    errors,
    automaticRetry: false,
  };
}

export function runMockGateway(value: unknown, options: MockGatewayRunOptions = {}): MockGatewayResult {
  if (options.forceFallbackReason) {
    return fallbackResult(options.forceFallbackReason, value, []);
  }

  const requestValidation = validateMockGatewayRequest(value);

  if (!requestValidation.valid || !requestValidation.request) {
    return fallbackResult("invalid-request", value, requestValidation.errors);
  }

  const response = options.syntheticOutputOverride
    ? validateMockGatewaySyntheticOutput(
        options.syntheticOutputOverride,
        requestValidation.request.contextPacket.requestId,
      )
    : createMockGatewayResponse(requestValidation.request);

  if (response.status === "fallback" || !response.output) {
    return fallbackResult("validation-rejected", requestValidation.request, response.errors, response);
  }

  return {
    status: "mock-output",
    request: requestValidation.request,
    response,
    typedCaptureText: extractTypedCaptureTextFromMockGatewayInput(requestValidation.request),
    automaticRetry: false,
  };
}
