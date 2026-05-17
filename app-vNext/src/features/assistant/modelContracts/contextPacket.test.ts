import {
  createAssistantContextPacket,
  validateAssistantContextPacket,
  type AssistantContextSource,
} from "./contextPacket";

const allowedSources: AssistantContextSource[] = [
  {
    id: "capture-1",
    sourceType: "typed-capture",
    sourceLabel: "Typed capture",
    text: "Reply to Maya about Friday plans",
    state: "draft",
  },
  {
    id: "task-1",
    sourceType: "selected-task",
    sourceLabel: "Selected task",
    title: "Reply to Maya about Friday plans",
    notes: "Manual follow-up task.",
    priority: "P1",
    listName: "Inbox",
    dueDate: "2026-05-17",
    estimateMinutes: 15,
  },
  {
    id: "note-1",
    sourceType: "selected-note-context",
    sourceLabel: "Selected saved context",
    title: "Sunday reset brief",
    excerpt: "Review the week and keep only the next useful action.",
    tags: ["review", "today"],
    pinned: true,
    contextGroup: "Today review",
  },
  {
    id: "day-1",
    sourceType: "selected-day-summary",
    sourceLabel: "Selected day summary",
    date: "2026-05-17",
    dayMode: "recovery",
    fixedCommitmentCount: 2,
    openWindowCount: 3,
    openMinutes: 180,
    taskBlockCount: 4,
  },
  {
    id: "contact-1",
    sourceType: "selected-contact-place",
    sourceLabel: "Selected contact place labels",
    displayName: "Maya Chen",
    relationship: "Friend",
    currentCity: "Portland, OR",
    region: "Pacific Northwest",
    lastKnownPlace: "Seattle, WA",
    movedRecently: true,
    visitNote: "Check in when visiting Portland this summer.",
  },
  {
    id: "fixture-1",
    sourceType: "demo-fixture",
    sourceLabel: "Demo fixture",
    fixtureName: "Stage 20 review data",
    description: "Fictional local review data only.",
  },
];

const validContextPacket = createAssistantContextPacket({
  requestId: "stage-20-context-proof",
  route: {
    routeId: "today",
    routeLabel: "Today",
    path: "/app/hq?demo=1",
  },
  sources: allowedSources,
});

const broadContextPacket = {
  version: "stage-20-context-v1",
  requestId: "bad-broad-context",
  route: {
    routeId: "today",
    routeLabel: "Today",
    path: "/app/hq?demo=1",
  },
  readPolicy: "minimum-needed-only",
  confirmationPolicy: "suggestions-only",
  sources: [
    {
      id: "dump-1",
      sourceType: "full-app-export",
      sourceLabel: "Everything",
      databaseDump: [{ title: "This should never be sent" }],
    },
  ],
};

const secretContextPacket = {
  version: "stage-20-context-v1",
  requestId: "bad-secret-context",
  route: {
    routeId: "today",
    routeLabel: "Today",
    path: "/app/hq?demo=1",
  },
  readPolicy: "minimum-needed-only",
  confirmationPolicy: "suggestions-only",
  sources: [
    {
      id: "route-1",
      sourceType: "current-route",
      sourceLabel: "Current route",
      routeId: "today",
      routeLabel: "Today",
      path: "/app/hq?demo=1",
    },
    {
      id: "secret-1",
      sourceType: "selected-task",
      sourceLabel: "Bad secret-bearing task",
      title: "Do not send secrets",
      apiKey: "not-a-real-key",
      authSessionPayload: "not-a-real-session",
    },
  ],
};

const exactLocationContextPacket = {
  version: "stage-20-context-v1",
  requestId: "bad-location-context",
  route: {
    routeId: "contacts",
    routeLabel: "Contacts",
    path: "/app/easycontacts?demo=1",
  },
  readPolicy: "minimum-needed-only",
  confirmationPolicy: "suggestions-only",
  sources: [
    {
      id: "route-1",
      sourceType: "current-route",
      sourceLabel: "Current route",
      routeId: "contacts",
      routeLabel: "Contacts",
      path: "/app/easycontacts?demo=1",
    },
    {
      id: "contact-1",
      sourceType: "selected-contact-place",
      sourceLabel: "Bad exact location",
      displayName: "Fictional Person",
      exactStreetAddress: "123 Fake Street",
      latitude: 45,
      longitude: -122,
    },
  ],
};

export const contextPacketProof = [
  {
    name: "valid bounded local context packet",
    validation: validateAssistantContextPacket(validContextPacket),
    expectedValid: true,
  },
  {
    name: "reject broad app export",
    validation: validateAssistantContextPacket(broadContextPacket),
    expectedValid: false,
  },
  {
    name: "reject secret-bearing fields",
    validation: validateAssistantContextPacket(secretContextPacket),
    expectedValid: false,
  },
  {
    name: "reject exact location fields",
    validation: validateAssistantContextPacket(exactLocationContextPacket),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const contextPacketProofPassed = contextPacketProof.every((example) => example.passed);

export const contextPacketAllowedSourceTypes = validContextPacket.sources.map((source) => source.sourceType);
