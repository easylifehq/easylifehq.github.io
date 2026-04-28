import { useState } from "react";

import type { AiBrief, AiCommand, AiSuggestion } from "./aiContracts";

const mockCommands: AiCommand[] = [
  {
    title: "Plan Day",
    source: "EasyList + EasyCalendar",
    status: "Sandbox",
    response: "Builds a clean day plan from sample tasks, calendar blocks, and focus windows.",
    preview: "9:00 focus, 1:30 errands, 3:00 client prep",
  },
  {
    title: "Clean Up Tasks",
    source: "EasyList",
    status: "Draft only",
    response: "Clusters a sample inbox into clearer categories without saving changes.",
    preview: "Work, Home, Follow-up, Someday",
  },
  {
    title: "Summarize Notes",
    source: "EasyNotes",
    status: "Sample data",
    response: "Turns sample meeting notes into decisions, open questions, and next actions.",
    preview: "3 decisions, 2 questions, 1 next action",
  },
  {
    title: "Prep Calendar",
    source: "EasyCalendar",
    status: "Preview",
    response: "Reviews a sample schedule and suggests prep notes before busy blocks.",
    preview: "Standup notes, travel buffer, agenda reminder",
  },
  {
    title: "Workout Coach",
    source: "EasyWorkout",
    status: "Coach preview",
    response: "Drafts a balanced workout suggestion from sample routine and recovery context.",
    preview: "Push strength, mobility finisher, lighter volume",
  },
  {
    title: "Project Focus",
    source: "EasyProjects + EasyList",
    status: "Focus mode",
    response: "Chooses one sample project outcome and the next three tasks that support it.",
    preview: "Ship review flow, unblock copy, prep handoff",
  },
];

const mockCommandInputResponses: AiSuggestion[] = [
  {
    prompt: "Plan my day",
    title: "Day plan preview",
    response: "Prioritize the proposal outline, keep the review call prepped, and move low-energy chores after the appointment buffer.",
    actions: ["9:00 deep work", "11:15 prep notes", "3:30 admin batch"],
  },
  {
    prompt: "Turn this note into tasks",
    title: "Task extraction preview",
    response: "I found three editable draft tasks from the note and left the original note untouched.",
    actions: ["Draft follow-up email", "Confirm timeline", "Add budget question"],
  },
  {
    prompt: "Summarize my week",
    title: "Weekly summary preview",
    response: "This sample week trends toward heavy planning, two unresolved follow-ups, and one workout consistency win.",
    actions: ["2 project milestones", "4 completed tasks", "1 missed recovery day"],
  },
  {
    prompt: "Build a workout plan",
    title: "Workout plan preview",
    response: "Use a balanced upper-body session today with light conditioning because the sample log shows lower-body fatigue.",
    actions: ["Push strength", "Core circuit", "10 minute mobility"],
  },
];

const mockSignals = [
  { label: "Sample tasks", value: "12" },
  { label: "Sample events", value: "4" },
  { label: "Sample notes", value: "7" },
];

const mockDailyBrief: AiBrief = {
  dateLabel: "Today preview",
  headline: "Protect the deep work block and clear the two time-sensitive follow-ups.",
  whatMatters: [
    "Finish the client proposal outline before the 11:30 calendar review.",
    "Confirm the appointment change so the afternoon stays flexible.",
    "Keep the workout lighter because yesterday's sample log shows heavy lower-body volume.",
  ],
  sections: [
    {
      title: "Tasks",
      items: ["Send revised proposal bullets", "Pay utility bill", "Move garage cleanup to Saturday"],
    },
    {
      title: "Notes",
      items: ["Meeting note has 3 open questions", "Recipe idea should become a weekend task"],
    },
    {
      title: "Calendar",
      items: ["9:00 focus block", "11:30 review call", "4:15 appointment buffer"],
    },
    {
      title: "Workout",
      items: ["Upper-body maintenance", "10 minute mobility finisher", "Skip max-effort leg work"],
    },
  ],
  warnings: [
    "Two sample tasks compete with the same 30 minute window.",
    "One sample calendar event is missing prep notes.",
  ],
};

export function AiCommandCenter() {
  const [commandInput, setCommandInput] = useState("Plan my day");
  const [mockResponse, setMockResponse] = useState<AiSuggestion>(mockCommandInputResponses[0]);

  function runMockCommand(prompt: string) {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const response =
      mockCommandInputResponses.find((mock) => mock.prompt.toLowerCase() === normalizedPrompt) ??
      mockCommandInputResponses.find((mock) => normalizedPrompt.includes(mock.prompt.toLowerCase())) ??
      {
        prompt: prompt.trim() || "Untitled sandbox command",
        title: "Assistant draft preview",
        response: "This sandbox would return an editable draft only. No API call runs and no EasyLife data is changed.",
        actions: ["Review suggested output", "Edit before saving", "Discard safely"],
      };

    setMockResponse(response);
  }

  return (
    <>
      <div className="settings-labs-summary">
        <article>
          <span>EasyLife AI Lab</span>
          <strong>AI workspace lab</strong>
          <p>
            A frontend-only sandbox for testing command flows before any connected assistant, API, or
            data-writing work exists.
          </p>
        </article>
        {mockSignals.map((signal) => (
          <article key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>Sample context available to this lab preview.</p>
          </article>
        ))}
      </div>

      <section className="ai-daily-brief" aria-labelledby="ai-daily-brief-title">
        <div className="ai-daily-brief-hero">
          <span className="settings-card-topline">
            <span>Sample daily brief</span>
            <span className="settings-state-pill">No API</span>
          </span>
          <h3 id="ai-daily-brief-title">{mockDailyBrief.dateLabel}</h3>
          <p>{mockDailyBrief.headline}</p>
          <ul className="ai-lab-context-strip" aria-label="Mock EasyLife context used by this brief">
            <li>EasyList sample tasks</li>
            <li>EasyNotes sample notes</li>
            <li>EasyCalendar sample events</li>
          </ul>
        </div>

        <div className="ai-daily-brief-focus">
          <span>What matters today</span>
          <ul>
            {mockDailyBrief.whatMatters.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="ai-daily-brief-grid">
          {mockDailyBrief.sections.map((section) => (
            <article key={section.title} className="ai-daily-brief-card">
              <strong>{section.title}</strong>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="ai-daily-brief-warnings">
          <span>Warnings</span>
          {mockDailyBrief.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      </section>

      <section className="ai-command-input-panel" aria-labelledby="ai-command-input-title">
        <div className="ai-command-input-copy">
          <span className="settings-card-topline">
            <span>Command input</span>
            <span className="settings-state-pill">No API</span>
          </span>
          <h3 id="ai-command-input-title">Try a safe AI command</h3>
          <p>Type a command or pick a prompt to preview an editable response without calling an API.</p>
        </div>

        <form
          className="ai-command-input-form"
          onSubmit={(event) => {
            event.preventDefault();
            runMockCommand(commandInput);
          }}
        >
          <label htmlFor="ai-command-input">Command</label>
          <div className="ai-command-input-row">
            <input
              id="ai-command-input"
              type="text"
              value={commandInput}
              onChange={(event) => setCommandInput(event.target.value)}
              placeholder="Plan my day"
            />
            <button type="submit">Preview</button>
          </div>
        </form>

        <div className="ai-command-prompt-list" aria-label="Sample prompt examples">
          {mockCommandInputResponses.map((mock) => (
            <button
              key={mock.prompt}
              type="button"
              onClick={() => {
                setCommandInput(mock.prompt);
                runMockCommand(mock.prompt);
              }}
            >
              {mock.prompt}
            </button>
          ))}
        </div>

        <article className="ai-command-response-preview" aria-live="polite">
          <span>{mockResponse.title}</span>
          <p>{mockResponse.response}</p>
          <ul>
            {mockResponse.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
      </section>

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
