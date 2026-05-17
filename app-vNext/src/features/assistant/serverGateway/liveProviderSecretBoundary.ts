import {
  isForbiddenFrontendProviderSecretName,
  liveAiForbiddenBrowserSecretSurfaces,
  liveAiServerSecretPlaceholderName,
} from "./liveAiEnvironment";

export const liveProviderSecretBoundaryVersion =
  "stage-31-live-provider-secret-boundary-v1" as const;

export const liveProviderSecretBoundaryPlaceholderName =
  liveAiServerSecretPlaceholderName;

export const liveProviderSecretBoundaryAllowedRuntime = "server" as const;

export const liveProviderSecretBoundaryForbiddenRuntime = "browser" as const;

export const liveProviderSecretBoundaryStates = [
  "server-secret-configured",
  "server-secret-unconfigured",
  "blocked-browser-runtime",
  "blocked-frontend-secret-name",
  "blocked-secret-value-read",
  "fallback",
] as const;

export type LiveProviderSecretBoundaryState =
  (typeof liveProviderSecretBoundaryStates)[number];

export type LiveProviderSecretBoundaryRuntime =
  | typeof liveProviderSecretBoundaryAllowedRuntime
  | typeof liveProviderSecretBoundaryForbiddenRuntime;

export type LiveProviderSecretBoundaryCheck = {
  version: typeof liveProviderSecretBoundaryVersion;
  placeholderName: string;
  runtime: LiveProviderSecretBoundaryRuntime;
  serverReportsConfigured: boolean;
  attemptedSecretValueRead?: boolean;
};

export type LiveProviderSecretBoundaryResult = {
  version: typeof liveProviderSecretBoundaryVersion;
  valid: boolean;
  state: LiveProviderSecretBoundaryState;
  placeholderName: typeof liveProviderSecretBoundaryPlaceholderName | string;
  providerCallAllowed: boolean;
  serverReportsConfigured: boolean;
  localFallbackRequired: boolean;
  secretValueRead: false;
  secretValueVisible: false;
  frontendSecretExposure: false;
  errors: string[];
  warnings: string[];
};

const forbiddenSecretValueKeys = [
  "apiKey",
  "key",
  "providerApiKey",
  "providerKey",
  "rawSecret",
  "secret",
  "secretValue",
  "token",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function includesForbiddenSecretValueKey(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return Object.keys(value).some((key) =>
    forbiddenSecretValueKeys.some((forbiddenKey) => key.toLowerCase() === forbiddenKey.toLowerCase()),
  );
}

function result(input: {
  state: LiveProviderSecretBoundaryState;
  placeholderName?: string;
  runtime?: LiveProviderSecretBoundaryRuntime;
  serverReportsConfigured?: boolean;
  errors?: string[];
  warnings?: string[];
}): LiveProviderSecretBoundaryResult {
  const localFallbackRequired =
    input.state !== "server-secret-configured" || input.serverReportsConfigured !== true;

  return {
    version: liveProviderSecretBoundaryVersion,
    valid: input.errors?.length ? false : input.state === "server-secret-configured",
    state: input.state,
    placeholderName: input.placeholderName ?? liveProviderSecretBoundaryPlaceholderName,
    providerCallAllowed: input.state === "server-secret-configured" && input.serverReportsConfigured === true,
    serverReportsConfigured: input.serverReportsConfigured ?? false,
    localFallbackRequired,
    secretValueRead: false,
    secretValueVisible: false,
    frontendSecretExposure: false,
    errors: input.errors ?? [],
    warnings: input.warnings ?? [],
  };
}

export function assessLiveProviderSecretBoundary(
  value: unknown,
): LiveProviderSecretBoundaryResult {
  if (!isRecord(value)) {
    return result({
      state: "fallback",
      errors: ["Secret boundary check must be an object."],
    });
  }

  const placeholderName =
    typeof value.placeholderName === "string" ? value.placeholderName : "";
  const runtime = value.runtime;
  const serverReportsConfigured = value.serverReportsConfigured === true;
  const attemptedSecretValueRead = value.attemptedSecretValueRead === true;

  if (includesForbiddenSecretValueKey(value) || attemptedSecretValueRead) {
    return result({
      state: "blocked-secret-value-read",
      placeholderName,
      runtime: runtime === "server" || runtime === "browser" ? runtime : undefined,
      serverReportsConfigured: false,
      errors: ["Secret boundary may only receive placeholder metadata, never a provider secret value."],
    });
  }

  if (placeholderName !== liveProviderSecretBoundaryPlaceholderName) {
    return result({
      state: isForbiddenFrontendProviderSecretName(placeholderName)
        ? "blocked-frontend-secret-name"
        : "fallback",
      placeholderName,
      runtime: runtime === "server" || runtime === "browser" ? runtime : undefined,
      serverReportsConfigured: false,
      errors: [
        isForbiddenFrontendProviderSecretName(placeholderName)
          ? "Provider secret placeholder must not use a browser-exposed VITE_ name."
          : `Provider secret placeholder must be ${liveProviderSecretBoundaryPlaceholderName}.`,
      ],
    });
  }

  if (runtime === liveProviderSecretBoundaryForbiddenRuntime) {
    return result({
      state: "blocked-browser-runtime",
      placeholderName,
      runtime,
      serverReportsConfigured: false,
      errors: ["Provider secrets cannot be accessed from browser runtime."],
    });
  }

  if (runtime !== liveProviderSecretBoundaryAllowedRuntime) {
    return result({
      state: "fallback",
      placeholderName,
      serverReportsConfigured: false,
      errors: ["Provider secret boundary requires server runtime metadata."],
    });
  }

  if (!serverReportsConfigured) {
    return result({
      state: "server-secret-unconfigured",
      placeholderName,
      runtime,
      serverReportsConfigured,
      warnings: ["Server secret is unconfigured; local fallback is required."],
    });
  }

  return result({
    state: "server-secret-configured",
    placeholderName,
    runtime,
    serverReportsConfigured,
  });
}

export const liveProviderSecretBoundaryContract = {
  version: liveProviderSecretBoundaryVersion,
  placeholderName: liveProviderSecretBoundaryPlaceholderName,
  allowedRuntime: liveProviderSecretBoundaryAllowedRuntime,
  forbiddenRuntime: liveProviderSecretBoundaryForbiddenRuntime,
  forbiddenFrontendSecretPrefixes: ["VITE_"],
  forbiddenBrowserSecretSurfaces: liveAiForbiddenBrowserSecretSurfaces,
  reportsConfiguredStateOnly: true,
  readsSecretValue: false,
  printsSecretValue: false,
  providerSdkRequired: false,
  providerCallAllowedFromBrowser: false,
  localFallbackWhenUnconfigured: true,
} as const;
