import { validateAssistantModelOutput } from "../modelContracts/modelOutputValidator";
import {
  createServerGatewayLiveDryRunFallbackResponse,
  createServerGatewayLiveDryRunMetadataLog,
  serverGatewayLiveDryRunAllowedRuntime,
  serverGatewayLiveDryRunBrowserRuntime,
  serverGatewayLiveDryRunDefaultEnabled,
  serverGatewayLiveDryRunProviderPlaceholder,
  serverGatewayLiveDryRunSecretPlaceholder,
  serverGatewayLiveDryRunTimeoutMs,
  validateServerGatewayLiveDryRunRequest,
  type ServerGatewayLiveDryRunOptions,
  type ServerGatewayLiveDryRunProviderRequest,
  type ServerGatewayLiveDryRunResponseEnvelope,
} from "./serverGatewayLiveDryRunTypes";

export function isServerGatewayLiveDryRunResponseStale(
  response: ServerGatewayLiveDryRunResponseEnvelope | null | undefined,
  currentRequestId: string,
) {
  return Boolean(response?.requestId && response.requestId !== currentRequestId);
}

export async function runServerGatewayLiveDryRun(
  value: unknown,
  options: ServerGatewayLiveDryRunOptions = {},
): Promise<ServerGatewayLiveDryRunResponseEnvelope> {
  const requestValidation = validateServerGatewayLiveDryRunRequest(value);
  const config = options.config ?? {};
  const enabled = config.enabled ?? serverGatewayLiveDryRunDefaultEnabled;
  const runtime = config.runtime ?? serverGatewayLiveDryRunBrowserRuntime;

  if (!requestValidation.valid || !requestValidation.request) {
    return createServerGatewayLiveDryRunFallbackResponse("invalid-request", {
      requestLike: value,
      errors: requestValidation.errors,
      requestValidationState: "rejected",
      runtime,
      validationResult: "not-run",
    });
  }

  const request = requestValidation.request;

  if (config.killSwitchOpen) {
    return createServerGatewayLiveDryRunFallbackResponse("circuit-open", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
    });
  }

  if (config.rateLimited) {
    return createServerGatewayLiveDryRunFallbackResponse("rate-limit", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
      rateLimitBucket: "blocked",
    });
  }

  if (config.timeout) {
    return createServerGatewayLiveDryRunFallbackResponse("timeout", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
      latencyBucket: "timed-out",
    });
  }

  if (!enabled) {
    return createServerGatewayLiveDryRunFallbackResponse("ai-disabled", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
    });
  }

  if (runtime !== serverGatewayLiveDryRunAllowedRuntime) {
    return createServerGatewayLiveDryRunFallbackResponse("server-only-required", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
    });
  }

  if (config.providerConfigured !== true || !options.serverOnlyProviderExecutor) {
    return createServerGatewayLiveDryRunFallbackResponse("provider-unconfigured", {
      requestLike: request,
      runtime,
      validationResult: "not-run",
    });
  }

  const providerRequest: ServerGatewayLiveDryRunProviderRequest = {
    promptId: "intake-suggestion",
    expectedOutputSchemaName: "AssistantIntakeSuggestionOutputV1",
    contextPacket: request.contextPacket,
    metadata: createServerGatewayLiveDryRunMetadataLog({
      requestLike: request,
      providerCallAttempted: true,
      latencyBucket: "under-15s",
    }),
  };

  try {
    const providerOutput = await options.serverOnlyProviderExecutor(providerRequest);
    const outputValidation = validateAssistantModelOutput(providerOutput);

    if (!outputValidation.valid || !outputValidation.output) {
      return createServerGatewayLiveDryRunFallbackResponse("validation-rejected", {
        requestLike: request,
        runtime,
        providerCallAttempted: true,
        providerCallState: "called-by-server-executor",
        validationResult: outputValidation.safetyState,
        errors: outputValidation.errors,
        warnings: outputValidation.warnings,
      });
    }

    return {
      responseVersion: "stage-26-live-dry-run-response-v1",
      requestId: request.contextPacket.requestId,
      status: "ok",
      requestValidationState: "accepted",
      outputValidationState: outputValidation.safetyState,
      output: outputValidation.output,
      metadataLog: createServerGatewayLiveDryRunMetadataLog({
        requestLike: request,
        validationResult: outputValidation.safetyState,
        providerCallAttempted: true,
        latencyBucket: "under-15s",
      }),
      errors: outputValidation.errors,
      warnings: outputValidation.warnings,
      providerName: serverGatewayLiveDryRunProviderPlaceholder,
      secretPlaceholder: serverGatewayLiveDryRunSecretPlaceholder,
      providerCallState: "called-by-server-executor",
      runtime,
      frontendSecretExposure: false,
      directBrowserProviderRequest: false,
      externalActions: false,
      hiddenWrites: false,
    };
  } catch {
    return createServerGatewayLiveDryRunFallbackResponse("provider-error", {
      requestLike: request,
      runtime,
      providerCallAttempted: true,
      providerCallState: "called-by-server-executor",
      validationResult: "not-run",
      errors: [
        `Server-only provider executor failed within the ${serverGatewayLiveDryRunTimeoutMs}ms dry-run boundary.`,
      ],
    });
  }
}
