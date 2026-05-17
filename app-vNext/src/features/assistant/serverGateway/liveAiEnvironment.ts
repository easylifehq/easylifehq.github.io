import type { AssistantPromptId } from "../prompts/promptRegistry";

export const liveAiEnvironmentContractVersion = "stage-30-live-ai-environment-v1" as const;

export const liveAiServerSecretPlaceholderName = "SERVER_AI_PROVIDER_API_KEY" as const;

export const liveAiEnabledFlagName = "SERVER_AI_PROVIDER_ENABLED" as const;

export const liveAiDisabledByDefault = false as const;

export const liveAiAllowedRoutePath = "/app/easylist/add?demo=1" as const;

export const liveAiAllowedPromptId = "intake-suggestion" as const satisfies AssistantPromptId;

export const liveAiProviderCallStates = [
  "disabled",
  "blocked-in-browser",
  "server-secret-missing",
  "server-ready-after-human-approval",
  "called-by-server-only",
  "fallback",
] as const;

export type LiveAiProviderCallState = (typeof liveAiProviderCallStates)[number];

export const liveAiProviderCallStateLabels = {
  disabled: "Live AI disabled by default",
  "blocked-in-browser": "Browser provider calls forbidden",
  "server-secret-missing": "Server provider secret not configured",
  "server-ready-after-human-approval": "Server-only call allowed after explicit approval",
  "called-by-server-only": "Provider called by server-only lane",
  fallback: "Local fallback active",
} as const satisfies Record<LiveAiProviderCallState, string>;

export const liveAiForbiddenFrontendSecretPrefixes = ["VITE_"] as const;

export const liveAiForbiddenBrowserSecretSurfaces = [
  "frontend bundle",
  "VITE_ environment variable",
  "localStorage",
  "sessionStorage",
  "browser request payload",
  "docs",
  "fixtures",
  "logs",
  "screenshots",
  "commits",
] as const;

export type LiveAiEnvironmentContract = {
  version: typeof liveAiEnvironmentContractVersion;
  serverSecretPlaceholderName: typeof liveAiServerSecretPlaceholderName;
  enabledFlagName: typeof liveAiEnabledFlagName;
  enabledByDefault: typeof liveAiDisabledByDefault;
  allowedRoutePath: typeof liveAiAllowedRoutePath;
  allowedPromptId: typeof liveAiAllowedPromptId;
  providerCallStates: typeof liveAiProviderCallStates;
  providerCallStateLabels: typeof liveAiProviderCallStateLabels;
  forbiddenFrontendSecretPrefixes: typeof liveAiForbiddenFrontendSecretPrefixes;
  forbiddenBrowserSecretSurfaces: typeof liveAiForbiddenBrowserSecretSurfaces;
  providerCallsAllowedFromBrowser: false;
  providerSdkAllowedInFrontend: false;
  hiddenWritesAllowed: false;
  externalActionsAllowed: false;
};

export const liveAiEnvironmentContract: LiveAiEnvironmentContract = {
  version: liveAiEnvironmentContractVersion,
  serverSecretPlaceholderName: liveAiServerSecretPlaceholderName,
  enabledFlagName: liveAiEnabledFlagName,
  enabledByDefault: liveAiDisabledByDefault,
  allowedRoutePath: liveAiAllowedRoutePath,
  allowedPromptId: liveAiAllowedPromptId,
  providerCallStates: liveAiProviderCallStates,
  providerCallStateLabels: liveAiProviderCallStateLabels,
  forbiddenFrontendSecretPrefixes: liveAiForbiddenFrontendSecretPrefixes,
  forbiddenBrowserSecretSurfaces: liveAiForbiddenBrowserSecretSurfaces,
  providerCallsAllowedFromBrowser: false,
  providerSdkAllowedInFrontend: false,
  hiddenWritesAllowed: false,
  externalActionsAllowed: false,
};

export type LiveAiEnvironmentValidation = {
  valid: boolean;
  errors: string[];
};

export function isForbiddenFrontendProviderSecretName(name: string) {
  return liveAiForbiddenFrontendSecretPrefixes.some((prefix) => name.startsWith(prefix));
}

export function validateLiveAiEnvironmentContract(
  contract: LiveAiEnvironmentContract,
): LiveAiEnvironmentValidation {
  const errors: string[] = [];

  if (contract.enabledByDefault !== false) {
    errors.push("Live AI must be disabled by default.");
  }

  if (contract.allowedRoutePath !== liveAiAllowedRoutePath) {
    errors.push(`Live AI route must stay limited to ${liveAiAllowedRoutePath}.`);
  }

  if (contract.allowedPromptId !== liveAiAllowedPromptId) {
    errors.push(`Live AI prompt must stay limited to ${liveAiAllowedPromptId}.`);
  }

  if (isForbiddenFrontendProviderSecretName(contract.serverSecretPlaceholderName)) {
    errors.push("Provider secret placeholder must not use a browser-exposed VITE_ name.");
  }

  if (contract.providerCallsAllowedFromBrowser !== false) {
    errors.push("Provider calls from the browser are forbidden.");
  }

  if (contract.providerSdkAllowedInFrontend !== false) {
    errors.push("Provider SDKs in the frontend are forbidden.");
  }

  if (contract.hiddenWritesAllowed !== false) {
    errors.push("Hidden writes remain forbidden.");
  }

  if (contract.externalActionsAllowed !== false) {
    errors.push("External actions remain forbidden.");
  }

  const missingStateLabels = contract.providerCallStates.filter(
    (state) => !contract.providerCallStateLabels[state],
  );

  if (missingStateLabels.length) {
    errors.push(`Provider call states missing labels: ${missingStateLabels.join(", ")}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const liveAiEnvironmentContractValidation =
  validateLiveAiEnvironmentContract(liveAiEnvironmentContract);
