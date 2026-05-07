import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import type { PriorityTier } from "@/lib/firestore/tasks";

type EmailSuggestionKind = "task" | "deadline" | "event" | "follow-up";
type EmailSuggestionState = "ready" | "approved" | "drafted" | "kept" | "ignored";

type EmailSuggestion = {
  id: string;
  kind: EmailSuggestionKind;
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  taskTitle: string;
  category: string;
  dueDate: string | null;
  estimatedLength: number | null;
  priorityTier: PriorityTier;
  confidence: "High" | "Medium" | "Low";
  recommendedAction: string;
  replyDraft?: string;
};

type ParsedEmailSeed = {
  from: string;
  subject: string;
  body: string;
};

const suggestionKindLabels: Record<EmailSuggestionKind, string> = {
  task: "Task",
  deadline: "Deadline",
  event: "Event",
  "follow-up": "Follow-up",
};

const suggestionStateLabels: Record<EmailSuggestionState, string> = {
  ready: "Needs review",
  approved: "Approved",
  drafted: "Draft awaiting approval",
  kept: "Kept visible",
  ignored: "Dismissed",
};

const sampleSuggestions: EmailSuggestion[] = [
  {
    id: "sample-final",
    kind: "follow-up",
    from: "Professor",
    subject: "Final exam confirmation",
    receivedAt: "Today",
    summary: "A professor asked whether you plan to take an optional final so they can print the right number of tests.",
    taskTitle: "Confirm final exam plan",
    category: "School",
    dueDate: toDateInputValue(new Date()),
    estimatedLength: 5,
    priorityTier: 2,
    confidence: "High",
    recommendedAction: "Draft a short reply and keep the thread visible until you answer.",
    replyDraft:
      "Hi Professor,\n\nThank you for clarifying. I would like to take the final.\n\nBest,\nSpencer",
  },
  {
    id: "sample-meeting",
    kind: "event",
    from: "League commissioner",
    subject: "Meeting tomorrow",
    receivedAt: "Yesterday",
    summary: "A meeting is scheduled tomorrow and you need to set up an account before joining.",
    taskTitle: "Set up account before tomorrow's meeting",
    category: "Personal",
    dueDate: toDateInputValue(addDays(new Date(), 1)),
    estimatedLength: 15,
    priorityTier: 4,
    confidence: "Medium",
    recommendedAction: "Create a prep task and leave the email in the action queue.",
  },
  {
    id: "sample-container",
    kind: "deadline",
    from: "Service reminder",
    subject: "Late fee assessed",
    receivedAt: "Today",
    summary: "A reminder says a return is late and daily fees may continue until it is handled.",
    taskTitle: "Return late container and update billing",
    category: "Errands",
    dueDate: toDateInputValue(new Date()),
    estimatedLength: 20,
    priorityTier: 3,
    confidence: "High",
    recommendedAction: "Create a task and keep the latest billing reminder visible.",
  },
  {
    id: "sample-noise",
    kind: "task",
    from: "Automated updates",
    subject: "Promotions and listing alerts",
    receivedAt: "This week",
    summary: "Repeated automated updates do not need a reply and should stay out of the inbox.",
    taskTitle: "Review obvious automated inbox noise",
    category: "Admin",
    dueDate: null,
    estimatedLength: 10,
    priorityTier: 8,
    confidence: "Medium",
    recommendedAction: "Keep visible if it matters, otherwise dismiss from this local review.",
  },
];

function splitImportedEmails(text: string): ParsedEmailSeed[] {
  return text
    .split(/\n\s*---+\s*\n|\n\s*\n(?=from\s*:)/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const from = chunk.match(/^from\s*:\s*(.+)$/im)?.[1]?.trim() || "Imported email";
      const subject = chunk.match(/^subject\s*:\s*(.+)$/im)?.[1]?.trim() || "No subject";
      const body = chunk
        .replace(/^from\s*:.*$/gim, "")
        .replace(/^subject\s*:.*$/gim, "")
        .replace(/^date\s*:.*$/gim, "")
        .trim();

      return { from, subject, body };
    });
}

function inferKind(text: string): EmailSuggestionKind {
  const lower = text.toLowerCase();

  if (/\b(meeting|calendar|tomorrow|available|join|appointment|call)\b/.test(lower)) return "event";
  if (/\b(invoice|statement|pay(?:ment)?|bill(?:ing)?|fee|charge|due back|late|deadline|due)\b/.test(lower)) return "deadline";
  if (/\b(reply|respond|let me know|confirm|question|can you|would you|follow up|follow-up)\b/.test(lower)) return "follow-up";
  return "task";
}

function inferDueDate(text: string) {
  const lower = text.toLowerCase();
  const today = new Date();

  if (/\b(today|tonight|asap|now)\b/.test(lower)) return toDateInputValue(today);
  if (/\b(tomorrow|tmrw|tmr)\b/.test(lower)) return toDateInputValue(addDays(today, 1));
  if (/\bnext week\b/.test(lower)) return toDateInputValue(addDays(today, 7));

  const slashMatch = lower.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (slashMatch) {
    const year = slashMatch[3]
      ? Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3])
      : today.getFullYear();
    const parsed = new Date(year, Number(slashMatch[1]) - 1, Number(slashMatch[2]));
    return Number.isNaN(parsed.getTime()) ? null : toDateInputValue(parsed);
  }

  const isoMatch = lower.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const parsed = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(parsed.getTime()) ? null : toDateInputValue(parsed);
  }

  return null;
}

function inferPriority(kind: EmailSuggestionKind, text: string): PriorityTier {
  const lower = text.toLowerCase();

  if (/\b(urgent|asap|late fee|overdue|blocked|cannot|must)\b/.test(lower)) return 2;
  if (kind === "deadline") return 3;
  if (kind === "follow-up" || kind === "event") return 4;
  if (/\b(newsletter|promo|sale|update|digest|recap)\b/.test(lower)) return 9;
  return 6;
}

function inferCategory(kind: EmailSuggestionKind, text: string) {
  const lower = text.toLowerCase();

  if (/\b(professor|assignment|exam|final|canvas|class|homework)\b/.test(lower)) return "School";
  if (/\b(rent|apartment|lease|landlord|maintenance)\b/.test(lower)) return "Home";
  if (/\b(pay(?:ment)?|invoice|statement|card|charge|fee)\b/.test(lower)) return "Finance";
  if (/\b(interview|resume|job|application)\b/.test(lower)) return "Work";
  if (kind === "event") return "Calendar";
  return "Admin";
}

function cleanTaskTitle(subject: string, kind: EmailSuggestionKind) {
  const cleaned = subject
    .replace(/^(re|fw|fwd)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (kind === "follow-up") return `Reply about ${cleaned}`;
  if (kind === "deadline") return `Handle ${cleaned}`;
  if (kind === "event") return `Prepare for ${cleaned}`;
  return cleaned || "Review imported email";
}

function buildReplyDraft() {
  return `Hi,\n\nThanks for reaching out. I saw this and will follow up shortly.\n\nBest,\nSpencer`;
}

function buildImportedSuggestion(seed: ParsedEmailSeed, index: number): EmailSuggestion {
  const combined = `${seed.subject}\n${seed.body}`;
  const kind = inferKind(combined);
  const priorityTier = inferPriority(kind, combined);

  return {
    id: `imported-${Date.now()}-${index}`,
    kind,
    from: seed.from,
    subject: seed.subject,
    receivedAt: "Imported",
    summary: seed.body
      ? seed.body.slice(0, 190).replace(/\s+/g, " ").trim()
      : "Imported email text for review.",
    taskTitle: cleanTaskTitle(seed.subject, kind),
    category: inferCategory(kind, combined),
    dueDate: inferDueDate(combined),
    estimatedLength: kind === "follow-up" ? 8 : kind === "event" ? 15 : kind === "deadline" ? 20 : 10,
    priorityTier,
    confidence: kind === "task" ? "Medium" : "High",
    recommendedAction:
      kind === "follow-up"
        ? "Prepare a reply draft, then decide whether this should become a task."
        : kind === "deadline"
          ? "Create a task and keep the email in view until handled."
          : kind === "event"
            ? "Create a prep task and check the calendar."
            : "Review once, then approve, keep visible, or dismiss.",
    replyDraft: kind === "follow-up" ? buildReplyDraft() : undefined,
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EasyListEmailPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [states, setStates] = useState<Record<string, EmailSuggestionState>>({});
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>(sampleSuggestions);
  const [importText, setImportText] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to review example inbox items.");

  const visibleSuggestions = useMemo(
    () => suggestions.filter((suggestion) => states[suggestion.id] !== "ignored"),
    [states, suggestions]
  );
  const readyCount = visibleSuggestions.filter((suggestion) => !states[suggestion.id] || states[suggestion.id] === "ready").length;
  const approvedCount = Object.values(states).filter((state) => state === "approved").length;
  const keptCount = Object.values(states).filter((state) => state === "kept").length;
  const selectedDraft = suggestions.find((suggestion) => suggestion.id === selectedDraftId && suggestion.replyDraft);
  const queueTypes: EmailSuggestionKind[] = ["task", "deadline", "event", "follow-up"];

  function handleScan() {
    setIsScanning(true);
    setStatusMessage("Refreshing example asks, deadlines, events, and follow-ups...");
    window.setTimeout(() => {
      setStates({});
      setSuggestions(sampleSuggestions);
      setIsScanning(false);
      setStatusMessage("Example inbox ready. Nothing is sent or archived until you approve it.");
    }, 520);
  }

  function handleImportEmails() {
    const seeds = splitImportedEmails(importText);
    const imported = seeds.map(buildImportedSuggestion);

    if (!imported.length) {
      setStatusMessage("Paste blocks with From: and Subject: lines, then try importing again.");
      return;
    }

    setSuggestions((current) => [...imported, ...current]);
    setImportText("");
    setStatusMessage(`Imported ${imported.length} email${imported.length === 1 ? "" : "s"} into the review queue.`);
  }

  function handleApprove(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "approved" }));
    setStatusMessage(`Approved "${suggestion.taskTitle}" as a local ${suggestionKindLabels[suggestion.kind]} suggestion.`);
  }

  function handleDraftReply(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "drafted" }));
    setSelectedDraftId(suggestion.id);
    setStatusMessage("Reply draft ready to review. Nothing is sent or created in mail.");
  }

  function handleKeepVisible(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "kept" }));
    setStatusMessage(`Kept "${suggestion.subject}" visible in this local review queue.`);
  }

  function handleIgnore(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "ignored" }));
    setSelectedDraftId((current) => (current === suggestion.id ? null : current));
    setStatusMessage(`Dismissed "${suggestion.subject}" from this review.`);
  }

  return (
    <>
      <PageSection
        eyebrow="Email triage"
        title="Approve inbox suggestions before anything changes"
        description="Review email examples as Task, Deadline, Event, and Follow-up suggestions. Nothing is sent or archived until you approve it."
      >
        <div className="email-triage-hero">
          <div>
            <span className="settings-state-pill">Inbox review</span>
            <h2>One queue, four decisions.</h2>
            <p>
              Each card names the suggestion type, source, and next safe step. Send and archive actions still need a
              separate approval.
            </p>
          </div>
          <div className="email-triage-actions">
            <button className="primary-button" type="button" onClick={handleScan} disabled={isScanning}>
              {isScanning ? "Refreshing..." : "Review example inbox"}
            </button>
            <Link className="button-secondary" to="/app/easylist/dashboard">
              Open Email list
            </Link>
          </div>
        </div>
        <div className="email-triage-stats" aria-label="Email triage status">
          <article>
            <span>Needs review</span>
            <strong>{readyCount}</strong>
          </article>
          <article>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </article>
          <article>
            <span>Kept visible</span>
            <strong>{keptCount}</strong>
          </article>
        </div>
        <div className="email-approval-lanes" aria-label="Inbox suggestion types">
          {queueTypes.map((kind) => (
            <article key={kind}>
              <span>{suggestionKindLabels[kind]}</span>
              <strong>{visibleSuggestions.filter((suggestion) => suggestion.kind === kind).length}</strong>
            </article>
          ))}
        </div>
        <p className="helper-copy">{statusMessage}</p>
      </PageSection>

      <PageSection
        eyebrow="Bridge"
        title="Paste email summaries"
        description="Paste one or more snippets. EasyLife suggests Task, Deadline, Event, or Follow-up actions for your review."
      >
        <div className="email-import-panel">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={7}
            placeholder={"From: Professor Example\nSubject: Final exam question\nPlease let me know if you are taking the final tomorrow.\n\n---\nFrom: Billing Reminder\nSubject: Late fee assessed\nYour return is late and a fee may continue until handled."}
            aria-label="Email summaries to import"
          />
          <div className="task-composer-actions">
            <span className="helper-copy">
              Paste emails here to review possible tasks, events, and replies. EasyLife will not send or archive anything.
            </span>
            <button className="primary-button" type="button" onClick={handleImportEmails} disabled={!importText.trim()}>
              Import to review
            </button>
          </div>
        </div>
      </PageSection>

      <PageSection eyebrow="Review" title="Review inbox suggestions">
        <div className="email-suggestion-list">
          {visibleSuggestions.map((suggestion) => {
            const state = states[suggestion.id] || "ready";

            return (
              <article className={`email-suggestion-card email-suggestion-card-${state}`} key={suggestion.id}>
                <div className="email-suggestion-meta">
                  <span>{suggestionKindLabels[suggestion.kind]}</span>
                  <span>{suggestion.confidence} confidence</span>
                  <span>{suggestion.receivedAt}</span>
                </div>
                <div className="email-suggestion-main">
                  <div>
                    <p>{suggestion.from}</p>
                    <h3>{suggestion.subject}</h3>
                    <strong>{suggestion.taskTitle}</strong>
                  </div>
                  <span className="info-pill">{suggestionStateLabels[state]}</span>
                </div>
                <p>{suggestion.summary}</p>
                <div className="email-task-preview">
                  <span>{suggestion.category}</span>
                  <span>{suggestion.dueDate || "No date"}</span>
                  <span>{suggestion.estimatedLength ? `${suggestion.estimatedLength} min` : "No estimate"}</span>
                  <span>{suggestion.priorityTier}. {getPriorityMeta(suggestion.priorityTier).label}</span>
                </div>
                <p className="helper-copy">{suggestion.recommendedAction}</p>
                <div className="email-card-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleApprove(suggestion)}
                    disabled={state === "approved"}
                  >
                    {state === "approved" ? "Approved" : `Approve ${suggestionKindLabels[suggestion.kind]}`}
                  </button>
                  {suggestion.replyDraft ? (
                    <button className="button-secondary" type="button" onClick={() => handleDraftReply(suggestion)}>
                      {state === "drafted" ? "Draft awaiting approval" : "Prepare draft for approval"}
                    </button>
                  ) : null}
                  <button className="button-secondary" type="button" onClick={() => handleKeepVisible(suggestion)}>
                    Keep visible
                  </button>
                  <button className="ghost-button" type="button" onClick={() => handleIgnore(suggestion)}>
                    Ignore
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </PageSection>

      {selectedDraft ? (
        <PageSection eyebrow="Reply draft" title="Draft awaiting approval">
          <div className="email-draft-panel">
            <div className="email-draft-approval">
              <strong>Approval required before send</strong>
              <p>Review this text first. Nothing is sent from EasyLife, and no mail draft is created here.</p>
            </div>
            <div>
              <span>To</span>
              <strong>{selectedDraft.from}</strong>
            </div>
            <div>
              <span>Subject</span>
              <strong>Re: {selectedDraft.subject}</strong>
            </div>
            <textarea readOnly value={selectedDraft.replyDraft || ""} rows={7} aria-label="Prepared reply draft" />
            <p className="helper-copy">
              Prepared for review only. Copy or rewrite it yourself when you are ready to send.
            </p>
          </div>
        </PageSection>
      ) : null}

      <PageSection eyebrow="Safety" title="Before any inbox action changes mail">
        <div className="email-integration-grid">
          <article>
            <span>1</span>
            <strong>Review first</strong>
            <p>Show likely tasks, deadlines, events, and follow-ups before anything changes.</p>
          </article>
          <article>
            <span>2</span>
            <strong>Prepare for review</strong>
            <p>Approve suggestions, prepare replies, or keep messages visible from one queue.</p>
          </article>
          <article>
            <span>3</span>
            <strong>Confirm before send or archive</strong>
            <p>Require a second clear approval before any real send or archive action exists.</p>
          </article>
        </div>
      </PageSection>
    </>
  );
}
