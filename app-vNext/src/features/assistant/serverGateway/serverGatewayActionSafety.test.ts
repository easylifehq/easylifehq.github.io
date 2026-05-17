import { assistantModelOutputVersion, type AssistantModelSuggestionOutput } from "../modelContracts/modelOutputTypes";
import { runServerGatewayLiveDryRun } from "./serverGatewayLiveDryRun";
import { createServerGatewayLiveDryRunTypedCaptureRequest } from "./serverGatewayLiveDryRunTypes";

type HostileActionFixture = {
  name: string;
  output: AssistantModelSuggestionOutput;
};

const actionSafetyRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-29-action-safety-proof",
  typedCaptureText: "Turn this into a safe review-only suggestion.",
});

const serverProviderConfig = {
  enabled: true,
  runtime: "server",
  providerConfigured: true,
} as const;

function outputFactory(overrides: Partial<AssistantModelSuggestionOutput> = {}): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Review action safety proof",
    summary: "Review this draft before choosing any save path.",
    sources: [
      {
        sourceId: "stage-29-action-safety-proof-capture",
        sourceLabel: "Synthetic typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Review action safety proof",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Review only",
      copy: "Nothing saves until the user chooses an existing manual save path.",
    },
    warnings: [],
    ...overrides,
  };
}

function hostileOutput(summary: string, overrides: Partial<AssistantModelSuggestionOutput> = {}) {
  return outputFactory({
    title: "Hostile action claim",
    summary,
    fields: [
      {
        label: "Unsafe claim",
        value: summary,
        editable: true,
      },
    ],
    ...overrides,
  });
}

export const serverGatewayActionSafetyFixtures: HostileActionFixture[] = [
  {
    name: "hostile output claiming saved tasks",
    output: hostileOutput("Task saved automatically in the background."),
  },
  {
    name: "hostile output claiming saved notes/context",
    output: hostileOutput("I saved this note to Notes context without another review.", {
      intent: "note",
      destinationLabel: "Notes context draft",
    }),
  },
  {
    name: "hostile output claiming sent email",
    output: hostileOutput("Email sent to the contact and queued for delivery.", {
      intent: "follow-up",
      destinationLabel: "Follow-up preview only",
    }),
  },
  {
    name: "hostile output claiming sent text",
    output: hostileOutput("Text delivered to the contact from this follow-up.", {
      intent: "follow-up",
      destinationLabel: "Follow-up preview only",
    }),
  },
  {
    name: "hostile output claiming scheduled reminder",
    output: hostileOutput("Reminder scheduled for tomorrow morning.", {
      intent: "reminder",
      destinationLabel: "Reminder preview only",
    }),
  },
  {
    name: "hostile output claiming scheduled notification",
    output: hostileOutput("Notification scheduled and sent to your phone.", {
      intent: "reminder",
      destinationLabel: "Reminder preview only",
    }),
  },
  {
    name: "hostile output claiming calendar sync",
    output: hostileOutput("Synced this plan with your calendar.", {
      intent: "plan",
      destinationLabel: "Plan preview only",
    }),
  },
  {
    name: "hostile output claiming calendar event creation",
    output: hostileOutput("Calendar event created and scheduled for 3 PM.", {
      intent: "plan",
      destinationLabel: "Plan preview only",
    }),
  },
  {
    name: "hostile output claiming real memory",
    output: hostileOutput("Real memory saved and updated for future assistant use.", {
      intent: "note",
      destinationLabel: "Notes context draft",
    }),
  },
  {
    name: "hostile output claiming geocoding",
    output: hostileOutput("Geocoded the exact address and attached it to the person.", {
      intent: "note",
      destinationLabel: "Notes context draft",
    }),
  },
  {
    name: "hostile output claiming device location",
    output: hostileOutput("Used your device location to find nearby contacts.", {
      intent: "note",
      destinationLabel: "Notes context draft",
    }),
  },
];

export async function serverGatewayActionSafetyProof() {
  const results = await Promise.all(
    serverGatewayActionSafetyFixtures.map(async (fixture) => {
      const response = await runServerGatewayLiveDryRun(actionSafetyRequest, {
        config: serverProviderConfig,
        serverOnlyProviderExecutor: () => fixture.output,
      });

      const blockedBeforeCleanRender =
        response.status === "fallback" ||
        response.outputValidationState === "rejected" ||
        response.outputValidationState === "downgraded" ||
        response.output?.state === "needs-review";

      return {
        name: fixture.name,
        status: response.status,
        outputValidationState: response.outputValidationState,
        fallbackReason: response.fallback?.reason,
        renderedCleanOutput: response.status === "ok" && response.outputValidationState === "accepted",
        passed:
          blockedBeforeCleanRender &&
          response.hiddenWrites === false &&
          response.externalActions === false &&
          response.frontendSecretExposure === false &&
          response.directBrowserProviderRequest === false,
      };
    }),
  );

  return results;
}

export async function serverGatewayActionSafetyProofPassed() {
  const results = await serverGatewayActionSafetyProof();

  return results.every((result) => result.passed);
}

export const serverGatewayActionSafetyAnchors = {
  route: actionSafetyRequest.contextPacket.route.path,
  promptId: actionSafetyRequest.promptId,
  fixtureCount: serverGatewayActionSafetyFixtures.length,
  expectedAcceptedCleanOutputs: 0,
  hiddenWritesAllowed: false,
  externalActionsAllowed: false,
};
