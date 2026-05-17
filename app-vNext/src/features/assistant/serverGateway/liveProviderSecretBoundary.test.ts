import {
  assessLiveProviderSecretBoundary,
  liveProviderSecretBoundaryAllowedRuntime,
  liveProviderSecretBoundaryContract,
  liveProviderSecretBoundaryPlaceholderName,
  liveProviderSecretBoundaryVersion,
} from "./liveProviderSecretBoundary";

const configuredServerBoundary = assessLiveProviderSecretBoundary({
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  runtime: "server",
  serverReportsConfigured: true,
});

const unconfiguredServerBoundary = assessLiveProviderSecretBoundary({
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  runtime: "server",
  serverReportsConfigured: false,
});

const browserBoundary = assessLiveProviderSecretBoundary({
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  runtime: "browser",
  serverReportsConfigured: true,
});

const viteBoundary = assessLiveProviderSecretBoundary({
  placeholderName: "VITE_AI_PROVIDER_API_KEY",
  runtime: "server",
  serverReportsConfigured: true,
});

const secretValueBoundary = assessLiveProviderSecretBoundary({
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  runtime: "server",
  serverReportsConfigured: true,
  secretValue: "redacted-test-value",
});

const explicitSecretReadBoundary = assessLiveProviderSecretBoundary({
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  runtime: "server",
  serverReportsConfigured: true,
  attemptedSecretValueRead: true,
});

const wrongPlaceholderBoundary = assessLiveProviderSecretBoundary({
  placeholderName: "SERVER_WRONG_PROVIDER_KEY",
  runtime: "server",
  serverReportsConfigured: true,
});

export const liveProviderSecretBoundaryProof = [
  {
    name: "contract references only server placeholder name",
    passed:
      liveProviderSecretBoundaryContract.version === liveProviderSecretBoundaryVersion &&
      liveProviderSecretBoundaryContract.placeholderName === "SERVER_AI_PROVIDER_API_KEY" &&
      liveProviderSecretBoundaryContract.allowedRuntime === liveProviderSecretBoundaryAllowedRuntime,
  },
  {
    name: "configured server state allows only server-side provider path",
    passed:
      configuredServerBoundary.valid &&
      configuredServerBoundary.state === "server-secret-configured" &&
      configuredServerBoundary.providerCallAllowed === true &&
      configuredServerBoundary.secretValueRead === false &&
      configuredServerBoundary.secretValueVisible === false &&
      configuredServerBoundary.frontendSecretExposure === false,
  },
  {
    name: "unconfigured server state preserves local fallback",
    passed:
      !unconfiguredServerBoundary.valid &&
      unconfiguredServerBoundary.state === "server-secret-unconfigured" &&
      unconfiguredServerBoundary.localFallbackRequired === true &&
      unconfiguredServerBoundary.providerCallAllowed === false,
  },
  {
    name: "browser runtime is blocked",
    passed:
      !browserBoundary.valid &&
      browserBoundary.state === "blocked-browser-runtime" &&
      browserBoundary.providerCallAllowed === false &&
      browserBoundary.localFallbackRequired === true,
  },
  {
    name: "VITE provider secret names are rejected",
    passed:
      !viteBoundary.valid &&
      viteBoundary.state === "blocked-frontend-secret-name" &&
      viteBoundary.errors.some((error) => error.includes("VITE_")),
  },
  {
    name: "secret values are rejected without echoing the value",
    passed:
      !secretValueBoundary.valid &&
      secretValueBoundary.state === "blocked-secret-value-read" &&
      !secretValueBoundary.errors.join(" ").includes("redacted-test-value") &&
      secretValueBoundary.secretValueRead === false &&
      secretValueBoundary.secretValueVisible === false,
  },
  {
    name: "attempted secret reads are rejected",
    passed:
      !explicitSecretReadBoundary.valid &&
      explicitSecretReadBoundary.state === "blocked-secret-value-read" &&
      explicitSecretReadBoundary.providerCallAllowed === false,
  },
  {
    name: "wrong server placeholder falls back",
    passed:
      !wrongPlaceholderBoundary.valid &&
      wrongPlaceholderBoundary.state === "fallback" &&
      wrongPlaceholderBoundary.localFallbackRequired === true,
  },
];

export const liveProviderSecretBoundaryProofPassed =
  liveProviderSecretBoundaryProof.every((example) => example.passed);

export const liveProviderSecretBoundaryProofAnchors = {
  placeholderName: liveProviderSecretBoundaryContract.placeholderName,
  allowedRuntime: liveProviderSecretBoundaryContract.allowedRuntime,
  forbiddenRuntime: liveProviderSecretBoundaryContract.forbiddenRuntime,
  configuredState: configuredServerBoundary.state,
  unconfiguredFallbackState: unconfiguredServerBoundary.state,
  browserBlockedState: browserBoundary.state,
  viteBlockedState: viteBoundary.state,
  secretValueBlockedState: secretValueBoundary.state,
  localFallbackWhenUnconfigured: liveProviderSecretBoundaryContract.localFallbackWhenUnconfigured,
};
