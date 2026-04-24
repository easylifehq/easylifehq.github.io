type MockCommand = {
  title: string;
  source: string;
  status: string;
  response: string;
  preview: string;
};

const mockCommands: MockCommand[] = [
  {
    title: "Plan Day",
    source: "EasyList + EasyCalendar",
    status: "Ready mock",
    response: "Builds a clean day plan from fake tasks, calendar blocks, and focus windows.",
    preview: "9:00 focus, 1:30 errands, 3:00 client prep",
  },
  {
    title: "Clean Up Tasks",
    source: "EasyList",
    status: "Draft only",
    response: "Clusters a messy mock inbox into clearer categories without saving changes.",
    preview: "Work, Home, Follow-up, Someday",
  },
  {
    title: "Summarize Notes",
    source: "EasyNotes",
    status: "Fake data",
    response: "Turns sample meeting notes into decisions, open questions, and next actions.",
    preview: "3 decisions, 2 questions, 1 next action",
  },
  {
    title: "Prep Calendar",
    source: "EasyCalendar",
    status: "Preview",
    response: "Reviews a mock schedule and suggests prep notes before busy blocks.",
    preview: "Standup notes, travel buffer, agenda reminder",
  },
  {
    title: "Workout Coach",
    source: "EasyWorkout",
    status: "Coach mock",
    response: "Drafts a balanced workout suggestion from fake routine and recovery context.",
    preview: "Push strength, mobility finisher, lighter volume",
  },
  {
    title: "Project Focus",
    source: "EasyProjects + EasyList",
    status: "Focus mode",
    response: "Chooses one mock project outcome and the next three tasks that support it.",
    preview: "Ship review flow, unblock copy, prep handoff",
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

      <div className="settings-review-grid ai-command-card-grid">
        {mockCommands.map((command) => (
          <article key={command.title} className="settings-review-card ai-command-card">
            <span className="settings-card-topline">
              <span>{command.source}</span>
              <span className="settings-state-pill">{command.status}</span>
            </span>
            <strong>{command.title}</strong>
            <p>{command.response}</p>
            <span className="ai-command-preview">{command.preview}</span>
          </article>
        ))}
      </div>
    </>
  );
}
