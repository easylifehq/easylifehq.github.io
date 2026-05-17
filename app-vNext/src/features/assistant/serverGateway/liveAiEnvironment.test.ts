import {
  isForbiddenFrontendProviderSecretName,
  liveAiAllowedPromptId,
  liveAiAllowedRoutePath,
  liveAiDisabledByDefault,
  liveAiEnvironmentContract,
  liveAiEnvironmentContractValidation,
  liveAiForbiddenBrowserSecretSurfaces,
  liveAiForbiddenFrontendSecretPrefixes,
  liveAiProviderCallStateLabels,
  liveAiProviderCallStates,
  liveAiServerSecretPlaceholderName,
  validateLiveAiEnvironmentContract,
  type LiveAiEnvironmentContract,
} from "./liveAiEnvironment";
import {
  serverGatewayLiveDryRunPromptId,
  serverGatewayLiveDryRunRoutePath,
  serverGatewayLiveDryRunSecretPlaceholder,
} from "./serverGatewayLiveDryRunTypes";

const viteSecretContract: LiveAiEnvironmentContract = {
  ...liveAiEnvironmentContract,
  serverSecretPlaceholderName: "VITE_AI_PROVIDER_API_KEY" as typeof liveAiServerSecretPlaceholderName,
};

const enabledContract: LiveAiEnvironmentContract = {
  ...liveAiEnvironmentContract,
  enabledByDefault: true as typeof liveAiDisabledByDefault,
};

const browserProviderContract: LiveAiEnvironmentContract = {
  ...liveAiEnvironmentContract,
  providerCallsAllowedFromBrowser: true as false,
};

export const liveAiEnvironmentContractProof = [
  {
    name: "contract is disabled by default",
    passed: liveAiEnvironmentContract.enabledByDefault === false,
  },
  {
    name: "server secret placeholder is server-only named",
    passed:
      liveAiEnvironmentContract.serverSecretPlaceholderName === "SERVER_AI_PROVIDER_API_KEY" &&
      liveAiEnvironmentContract.serverSecretPlaceholderName === serverGatewayLiveDryRunSecretPlaceholder &&
      !isForbiddenFrontendProviderSecretName(liveAiEnvironmentContract.serverSecretPlaceholderName),
  },
  {
    name: "VITE provider secret names are forbidden",
    passed:
      liveAiForbiddenFrontendSecretPrefixes.includes("VITE_") &&
      isForbiddenFrontendProviderSecretName("VITE_AI_PROVIDER_API_KEY") &&
      !isForbiddenFrontendProviderSecretName("SERVER_AI_PROVIDER_API_KEY"),
  },
  {
    name: "allowed route matches proven Inbox lane",
    passed:
      liveAiEnvironmentContract.allowedRoutePath === "/app/easylist/add?demo=1" &&
      liveAiAllowedRoutePath === serverGatewayLiveDryRunRoutePath,
  },
  {
    name: "allowed prompt matches intake suggestion only",
    passed:
      liveAiEnvironmentContract.allowedPromptId === "intake-suggestion" &&
      liveAiAllowedPromptId === serverGatewayLiveDryRunPromptId,
  },
  {
    name: "provider call state labels cover every state",
    passed: liveAiProviderCallStates.every((state) => Boolean(liveAiProviderCallStateLabels[state])),
  },
  {
    name: "browser secret surfaces include VITE env and frontend bundle",
    passed:
      liveAiForbiddenBrowserSecretSurfaces.includes("VITE_ environment variable") &&
      liveAiForbiddenBrowserSecretSurfaces.includes("frontend bundle"),
  },
  {
    name: "contract validation accepts the canonical contract",
    passed: liveAiEnvironmentContractValidation.valid,
  },
  {
    name: "contract validation rejects VITE secret placeholder",
    passed: !validateLiveAiEnvironmentContract(viteSecretContract).valid,
  },
  {
    name: "contract validation rejects enabled-by-default posture",
    passed: !validateLiveAiEnvironmentContract(enabledContract).valid,
  },
  {
    name: "contract validation rejects browser provider calls",
    passed: !validateLiveAiEnvironmentContract(browserProviderContract).valid,
  },
];

export const liveAiEnvironmentContractProofPassed = liveAiEnvironmentContractProof.every(
  (example) => example.passed,
);

export const liveAiEnvironmentProofAnchors = {
  route: liveAiEnvironmentContract.allowedRoutePath,
  promptId: liveAiEnvironmentContract.allowedPromptId,
  secretPlaceholderName: liveAiEnvironmentContract.serverSecretPlaceholderName,
  enabledFlagName: liveAiEnvironmentContract.enabledFlagName,
  defaultEnabled: liveAiEnvironmentContract.enabledByDefault,
  providerCallStates: [...liveAiEnvironmentContract.providerCallStates],
  forbiddenFrontendSecretPrefixes: [...liveAiEnvironmentContract.forbiddenFrontendSecretPrefixes],
};
