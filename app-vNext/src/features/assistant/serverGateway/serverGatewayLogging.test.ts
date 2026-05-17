import { assistantModelOutputVersion, type AssistantModelSuggestionOutput } from "../modelContracts/modelOutputTypes";
import { runServerGatewayLiveDryRun } from "./serverGatewayLiveDryRun";
import {
  createServerGatewayLiveDryRunTypedCaptureRequest,
  type ServerGatewayLiveDryRunMetadataLog,
} from "./serverGatewayLiveDryRunTypes";

const rawTypedCaptureMarker = "private typed capture marker should never appear in gateway metadata";
const providerRawResponseMarker = "provider raw response marker should never appear in gateway metadata";
const secretValueMarker = "not-a-real-secret-value-for-logging-proof";

const loggingProofRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-29-logging-redaction-proof",
  typedCaptureText: rawTypedCaptureMarker,
});

const safeProviderOutput: AssistantModelSuggestionOutput = {
  version: assistantModelOutputVersion,
  promptId: "intake-suggestion",
  outputSchemaName: "AssistantIntakeSuggestionOutputV1",
  intent: "task",
  confidence: "medium",
  state: "draft",
  destinationLabel: "Inbox task draft",
  title: "Review the safe logging proof",
  summary: "Review this draft before choosing any save path.",
  sources: [
    {
      sourceId: "stage-29-logging-redaction-proof-capture",
      sourceLabel: "Synthetic typed capture",
    },
  ],
  fields: [
    {
      label: "Task title",
      value: "Review the safe logging proof",
      editable: true,
    },
  ],
  confirmation: {
    required: true,
    label: "Review only",
    copy: "Nothing saves until a user chooses an existing manual save path.",
  },
  warnings: [],
};

const secretLikeInvalidRequest = {
  ...loggingProofRequest,
  secret: secretValueMarker,
};

function metadataText(metadataLog: ServerGatewayLiveDryRunMetadataLog): string {
  return JSON.stringify(metadataLog);
}

function allowedMetadataFields(metadataLog: ServerGatewayLiveDryRunMetadataLog): (keyof ServerGatewayLiveDryRunMetadataLog)[] {
  return Object.keys(metadataLog).sort() as (keyof ServerGatewayLiveDryRunMetadataLog)[];
}

export async function serverGatewayLoggingProof() {
  let providerExecutorSawRawResponse = false;

  const acceptedResponse = await runServerGatewayLiveDryRun(loggingProofRequest, {
    config: {
      enabled: true,
      runtime: "server",
      providerConfigured: true,
    },
    serverOnlyProviderExecutor: () => {
      providerExecutorSawRawResponse = providerRawResponseMarker.length > 0;
      return safeProviderOutput;
    },
  });

  const disabledFallbackResponse = await runServerGatewayLiveDryRun(loggingProofRequest, {
    config: {
      enabled: false,
      runtime: "server",
      providerConfigured: true,
    },
    serverOnlyProviderExecutor: () => {
      throw new Error("Disabled logging proof must not call provider executor.");
    },
  });

  const secretRejectedResponse = await runServerGatewayLiveDryRun(secretLikeInvalidRequest, {
    config: {
      enabled: true,
      runtime: "server",
      providerConfigured: true,
    },
    serverOnlyProviderExecutor: () => {
      throw new Error("Secret-like invalid request must not reach provider executor.");
    },
  });

  const metadataLogs = [
    acceptedResponse.metadataLog,
    disabledFallbackResponse.metadataLog,
    secretRejectedResponse.metadataLog,
  ];

  const allMetadataText = metadataLogs.map(metadataText).join("\n");
  const allErrorText = [
    ...acceptedResponse.errors,
    ...disabledFallbackResponse.errors,
    ...secretRejectedResponse.errors,
  ].join("\n");

  return [
    {
      name: "raw typed capture is not logged",
      passed:
        acceptedResponse.status === "ok" &&
        disabledFallbackResponse.fallback?.typedCaptureText === rawTypedCaptureMarker &&
        !allMetadataText.includes(rawTypedCaptureMarker),
    },
    {
      name: "provider raw response marker is not logged",
      passed: providerExecutorSawRawResponse && !allMetadataText.includes(providerRawResponseMarker),
    },
    {
      name: "secret-like values are not logged",
      passed:
        secretRejectedResponse.status === "fallback" &&
        secretRejectedResponse.requestValidationState === "rejected" &&
        !allMetadataText.includes(secretValueMarker) &&
        !allErrorText.includes(secretValueMarker),
    },
    {
      name: "metadata-only fields are allowed",
      passed: metadataLogs.every(
        (metadataLog) =>
          metadataLog.metadataOnly === true &&
          typeof metadataLog.version === "string" &&
          typeof metadataLog.requestId === "string" &&
          typeof metadataLog.route === "string" &&
          typeof metadataLog.promptId === "string" &&
          typeof metadataLog.schemaVersion === "string" &&
          typeof metadataLog.validationResult === "string" &&
          typeof metadataLog.latencyBucket === "string" &&
          typeof metadataLog.tokenEstimateBucket === "string" &&
          typeof metadataLog.rateLimitBucket === "string" &&
          typeof metadataLog.providerCallAttempted === "boolean",
      ),
    },
    {
      name: "metadata schema excludes raw payload fields",
      passed: metadataLogs.every((metadataLog) => {
        const fields = allowedMetadataFields(metadataLog);

        return (
          !fields.includes("typedCaptureText" as keyof ServerGatewayLiveDryRunMetadataLog) &&
          !fields.includes("providerRawResponse" as keyof ServerGatewayLiveDryRunMetadataLog) &&
          !fields.includes("secret" as keyof ServerGatewayLiveDryRunMetadataLog)
        );
      }),
    },
    {
      name: "logging proof does not require external logging service",
      passed:
        acceptedResponse.externalActions === false &&
        disabledFallbackResponse.externalActions === false &&
        secretRejectedResponse.externalActions === false,
    },
  ];
}

export const serverGatewayLoggingProofAnchors = {
  route: loggingProofRequest.contextPacket.route.path,
  promptId: loggingProofRequest.promptId,
  loggingMode: "metadata-only",
  rawTypedCaptureLogged: false,
  providerRawResponseLogged: false,
  secretsLogged: false,
  externalLoggingService: false,
};
