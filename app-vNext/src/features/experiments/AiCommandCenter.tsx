type MockCommand = {
  title: string;
  source: string;
  response: string;
  confidence: string;
};

const mockCommands: MockCommand[] = [
  {
    title: "Plan today",
    source: "EasyList + EasyCalendar",
    response: "Protect the 10 AM focus block, move two low-priority tasks, and prep the 3 PM call notes.",
    confidence: "Mock response",
  },
  {
    title: "Clean up tasks",
    source: "EasyList",
    response: "Group five inbox items into Work, Home, and Follow-up. No saves happen from this lab.",
    confidence: "Draft only",
  },
  {
    title: "Summarize notes",
    source: "EasyNotes",
    response: "Pull three decisions, two open questions, and one next action from the mock project notes.",
    confidence: "Fake data",
  },
];

const mockSignals = [
  { label: "Mock tasks", value: "12" },
  { label: "Mock events", value: "4" },
  { label: "Mock notes", value: "7" },
];

export function AiCommandCenter() {
  return (
    <>
      <div className="settings-labs-summary">
        <article>
          <span>EasyLife AI Lab</span>
          <strong>AI Command Center</strong>
          <p>
            A frontend-only sandbox for testing command flows before any real assistant, API, or
            data-writing work exists.
          </p>
        </article>
        {mockSignals.map((signal) => (
          <article key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>Fake context available to this lab preview.</p>
          </article>
        ))}
      </div>

      <div className="settings-review-grid">
        {mockCommands.map((command) => (
          <article key={command.title} className="settings-review-card">
            <span className="settings-card-topline">
              <span>{command.source}</span>
              <span className="settings-state-pill">{command.confidence}</span>
            </span>
            <strong>{command.title}</strong>
            <p>{command.response}</p>
          </article>
        ))}
      </div>
    </>
  );
}
