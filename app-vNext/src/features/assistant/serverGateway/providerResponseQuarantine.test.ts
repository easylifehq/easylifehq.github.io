import {
  assistantModelOutputVersion,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import { quarantineProviderResponse } from "./providerResponseQuarantine";

type QuarantineFixture = {
  name: string;
  value: unknown;
  expectedState: "accepted" | "downgraded" | "quarantined";
  expectedReason?: string;
};

function outputFactory(overrides: Partial<AssistantModelSuggestionOutput> = {}): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Review the pilot notes",
    summary: "Review this suggestion before choosing any save path.",
    sources: [
      {
        sourceId: "stage-30-provider-response-capture",
        sourceLabel: "Synthetic typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Review the pilot notes",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Final confirmation required",
      copy: "Nothing changes until you choose an existing save action.",
    },
    warnings: [],
    ...overrides,
  };
}

export const providerResponseQuarantineFixtures: QuarantineFixture[] = [
  {
    name: "accepted safe task suggestion passes through",
    value: outputFactory(),
    expectedState: "accepted",
  },
  {
    name: "downgraded action-like output can pass as needs-review",
    value: outputFactory({
      summary: "This is ready to save after review.",
    }),
    expectedState: "downgraded",
  },
  {
    name: "malformed response quarantines",
    value: "not-json-object-provider-response",
    expectedState: "quarantined",
    expectedReason: "malformed-response",
  },
  {
    name: "hidden-write claim quarantines",
    value: outputFactory({
      summary: "I saved this task to your inbox automatically.",
    }),
    expectedState: "quarantined",
    expectedReason: "hidden-write-claim",
  },
  {
    name: "external-action claim quarantines",
    value: outputFactory({
      summary: "Email sent and calendar event created.",
    }),
    expectedState: "quarantined",
    expectedReason: "external-action-claim",
  },
  {
    name: "real-memory claim quarantines",
    value: outputFactory({
      summary: "Real memory saved for future recall.",
    }),
    expectedState: "quarantined",
    expectedReason: "real-memory-claim",
  },
  {
    name: "missing source quarantines",
    value: outputFactory({
      sources: [],
    }),
    expectedState: "quarantined",
    expectedReason: "missing-source",
  },
  {
    name: "missing destination quarantines",
    value: {
      ...outputFactory(),
      destinationLabel: undefined,
    },
    expectedState: "quarantined",
    expectedReason: "missing-destination",
  },
  {
    name: "unsupported intent quarantines",
    value: {
      ...outputFactory(),
      intent: "errand",
    },
    expectedState: "quarantined",
    expectedReason: "unsupported-intent",
  },
];

export const providerResponseQuarantineProof = providerResponseQuarantineFixtures.map((fixture) => {
  const result = quarantineProviderResponse(fixture.value);
  const reasons = result.quarantine?.reasons ?? [];

  return {
    ...fixture,
    result,
    passed:
      result.state === fixture.expectedState &&
      (!fixture.expectedReason || reasons.includes(fixture.expectedReason as never)),
  };
});

export const providerResponseQuarantineProofPassed = providerResponseQuarantineProof.every(
  (fixture) => fixture.passed,
);

const hiddenWriteResult = quarantineProviderResponse(
  outputFactory({
    summary: "I saved this task to your inbox automatically.",
  }),
);

const acceptedResult = quarantineProviderResponse(outputFactory());

const downgradedResult = quarantineProviderResponse(
  outputFactory({
    summary: "This is ready to save after review.",
  }),
);

export const providerResponseQuarantineSummaryProof = [
  {
    name: "accepted output is renderable only after validation",
    passed:
      acceptedResult.state === "accepted" &&
      acceptedResult.validationState === "accepted" &&
      acceptedResult.output?.promptId === "intake-suggestion" &&
      acceptedResult.rawProviderResponseVisible === false,
  },
  {
    name: "downgraded output remains needs-review after validation",
    passed:
      downgradedResult.state === "downgraded" &&
      downgradedResult.validationState === "downgraded" &&
      downgradedResult.output?.state === "needs-review" &&
      downgradedResult.output.destinationLabel === "Needs review",
  },
  {
    name: "quarantined output cannot render as suggestion",
    passed:
      hiddenWriteResult.state === "quarantined" &&
      hiddenWriteResult.quarantine?.renderableAsSuggestion === false &&
      hiddenWriteResult.quarantine.rawProviderResponseVisible === false &&
      hiddenWriteResult.hiddenWrites === false &&
      hiddenWriteResult.externalActions === false,
  },
];

export const providerResponseQuarantineSummaryProofPassed =
  providerResponseQuarantineSummaryProof.every((fixture) => fixture.passed);
