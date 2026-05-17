import { validateAssistantModelOutput } from "../modelContracts/modelOutputValidator";
import {
  assistantModelOutputVersion,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";

type ReliabilityOutcome = "accepted" | "rejected" | "downgraded" | "fallback";

type ReliabilityEvaluation = {
  outcome: ReliabilityOutcome;
  validationState: "accepted" | "downgraded" | "rejected";
  errors: string[];
  warnings: string[];
  fallbackReason?: string;
};

type ReliabilityFixture = {
  name: string;
  value: unknown;
  expectedOutcome: Exclude<ReliabilityOutcome, "accepted">;
};

const maxAssistantTitleLength = 96;
const maxAssistantTextLength = 240;

function outputFactory(overrides: Partial<AssistantModelSuggestionOutput> = {}): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Review pilot notes",
    summary: "Review this draft before choosing any save path.",
    sources: [
      {
        sourceId: "stage-28-reliability-capture",
        sourceLabel: "Synthetic typed capture",
      },
    ],
    fields: [
      {
        label: "Task title",
        value: "Review pilot notes",
        editable: true,
      },
    ],
    confirmation: {
      required: true,
      label: "Final confirmation required",
      copy: "Review before using the existing task save path.",
    },
    warnings: [],
    ...overrides,
  };
}

function reliabilityTextParts(output: AssistantModelSuggestionOutput): string[] {
  return [
    output.title,
    output.summary,
    output.confirmation.copy,
    ...output.fields.map((field) => `${field.label} ${field.value}`),
    ...output.warnings,
  ];
}

function hasTooLongSuggestion(output: AssistantModelSuggestionOutput): boolean {
  return (
    output.title.length > maxAssistantTitleLength ||
    output.summary.length > maxAssistantTextLength ||
    output.fields.some((field) => field.value.length > maxAssistantTextLength)
  );
}

function hasOverconfidentLanguage(output: AssistantModelSuggestionOutput): boolean {
  return reliabilityTextParts(output).some((part) =>
    /100%|certain|definitely|guaranteed|no review needed|trust me/i.test(part),
  );
}

function duplicateSignature(output: AssistantModelSuggestionOutput): string {
  return JSON.stringify({
    promptId: output.promptId,
    intent: output.intent,
    destinationLabel: output.destinationLabel,
    title: output.title.trim().toLowerCase(),
    sources: output.sources.map((source) => source.sourceId).sort(),
  });
}

function reliabilityFallbackReason(output: AssistantModelSuggestionOutput): string | undefined {
  if (hasOverconfidentLanguage(output)) {
    return "overconfident-language";
  }

  if (hasTooLongSuggestion(output)) {
    return "too-long-suggestion";
  }

  return undefined;
}

function evaluateSingleReliabilityValue(value: unknown): ReliabilityEvaluation {
  const validation = validateAssistantModelOutput(value);

  if (!validation.valid || !validation.output) {
    return {
      outcome: "rejected",
      validationState: validation.safetyState,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  if (validation.safetyState === "downgraded") {
    return {
      outcome: "downgraded",
      validationState: validation.safetyState,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const fallbackReason = reliabilityFallbackReason(validation.output);

  if (fallbackReason) {
    return {
      outcome: "fallback",
      validationState: validation.safetyState,
      errors: validation.errors,
      warnings: validation.warnings,
      fallbackReason,
    };
  }

  return {
    outcome: "accepted",
    validationState: validation.safetyState,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

function evaluateDuplicateBatch(values: unknown[]): ReliabilityEvaluation {
  const signatures = new Set<string>();

  for (const value of values) {
    const validation = validateAssistantModelOutput(value);

    if (!validation.valid || !validation.output) {
      return {
        outcome: "rejected",
        validationState: validation.safetyState,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const signature = duplicateSignature(validation.output);

    if (signatures.has(signature)) {
      return {
        outcome: "fallback",
        validationState: validation.safetyState,
        errors: validation.errors,
        warnings: validation.warnings,
        fallbackReason: "duplicate-suggestion",
      };
    }

    signatures.add(signature);
  }

  return {
    outcome: "accepted",
    validationState: "accepted",
    errors: [],
    warnings: [],
  };
}

function evaluateReliabilityFixture(fixture: ReliabilityFixture): ReliabilityEvaluation {
  if (Array.isArray(fixture.value)) {
    return evaluateDuplicateBatch(fixture.value);
  }

  return evaluateSingleReliabilityValue(fixture.value);
}

const duplicateSuggestion = outputFactory({
  title: "Call Maya about the venue",
  summary: "Review this draft before choosing any save path.",
  fields: [
    {
      label: "Task title",
      value: "Call Maya about the venue",
      editable: true,
    },
  ],
});

const tooLongSummary = [
  "Review the pilot notes carefully before choosing any save path.",
  "Confirm the next owner, timing, context, and destination label.",
  "Keep the suggestion local and make sure the user still has an obvious final confirmation step.",
  "This intentionally long wording should not be accepted as a clean assistant suggestion.",
].join(" ");

export const serverGatewayReliabilityEdgeCaseFixtures: ReliabilityFixture[] = [
  {
    name: "empty output rejects",
    value: {},
    expectedOutcome: "rejected",
  },
  {
    name: "duplicate suggestions fall back",
    value: [duplicateSuggestion, { ...duplicateSuggestion }],
    expectedOutcome: "fallback",
  },
  {
    name: "missing source rejects",
    value: outputFactory({
      sources: [],
    }),
    expectedOutcome: "rejected",
  },
  {
    name: "wrong destination downgrades to needs-review",
    value: outputFactory({
      intent: "note",
      destinationLabel: "Inbox task draft",
      title: "Capture a context note",
      fields: [
        {
          label: "Context draft",
          value: "Keep this as note context after review.",
          editable: true,
        },
      ],
    }),
    expectedOutcome: "downgraded",
  },
  {
    name: "unknown destination rejects",
    value: {
      ...outputFactory(),
      destinationLabel: "Assistant saved item",
    },
    expectedOutcome: "rejected",
  },
  {
    name: "missing destination rejects",
    value: {
      ...outputFactory(),
      destinationLabel: undefined,
    },
    expectedOutcome: "rejected",
  },
  {
    name: "ambiguous save language downgrades",
    value: outputFactory({
      title: "Ambiguous save claim",
      summary: "Use this and save it wherever EasyLife thinks it should go.",
      fields: [
        {
          label: "Task title",
          value: "Use this and save it wherever EasyLife thinks it should go.",
          editable: true,
        },
      ],
    }),
    expectedOutcome: "downgraded",
  },
  {
    name: "overconfident language falls back",
    value: outputFactory({
      confidence: "high",
      title: "Definitely correct task",
      summary: "This is definitely correct and no review needed.",
      fields: [
        {
          label: "Task title",
          value: "Definitely correct task",
          editable: true,
        },
      ],
    }),
    expectedOutcome: "fallback",
  },
  {
    name: "unsupported intent rejects",
    value: {
      ...outputFactory(),
      intent: "errand",
    },
    expectedOutcome: "rejected",
  },
  {
    name: "too-long suggestion falls back",
    value: outputFactory({
      title: "Review the long pilot update",
      summary: tooLongSummary,
      fields: [
        {
          label: "Task title",
          value: tooLongSummary,
          editable: true,
        },
      ],
    }),
    expectedOutcome: "fallback",
  },
  {
    name: "hidden-action wording rejects",
    value: outputFactory({
      title: "Hidden action claim",
      summary: "I saved this task automatically and scheduled a reminder.",
      fields: [
        {
          label: "Task title",
          value: "I saved this task automatically and scheduled a reminder.",
          editable: true,
        },
      ],
    }),
    expectedOutcome: "rejected",
  },
];

export const serverGatewayReliabilityProof = serverGatewayReliabilityEdgeCaseFixtures.map((fixture) => {
  const evaluation = evaluateReliabilityFixture(fixture);

  return {
    ...fixture,
    evaluation,
    passed: evaluation.outcome === fixture.expectedOutcome,
  };
});

export const serverGatewayReliabilityProofPassed = serverGatewayReliabilityProof.every(
  (fixture) => fixture.passed,
);

export const serverGatewayReliabilitySummary = {
  fixtureCount: serverGatewayReliabilityProof.length,
  rejected: serverGatewayReliabilityProof.filter((fixture) => fixture.evaluation.outcome === "rejected").length,
  downgraded: serverGatewayReliabilityProof.filter((fixture) => fixture.evaluation.outcome === "downgraded")
    .length,
  fallback: serverGatewayReliabilityProof.filter((fixture) => fixture.evaluation.outcome === "fallback").length,
  acceptedBadCases: serverGatewayReliabilityProof.filter((fixture) => fixture.evaluation.outcome === "accepted")
    .length,
  passed: serverGatewayReliabilityProofPassed,
};
