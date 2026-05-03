import { useMemo, useState } from "react";
import { GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup } from "firebase/auth";
import { Link } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import { auth } from "@/lib/firebase/client";
import type { PriorityTier, TaskDraft } from "@/lib/firestore/tasks";

type EmailSuggestionKind = "task" | "reply" | "bill" | "meeting";
type EmailSuggestionState = "ready" | "tasked" | "drafted" | "archived" | "ignored";

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

type GmailSyncMessage = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  receivedAt: string;
  snippet: string;
  labels: string[];
};

const gmailSyncUrl =
  import.meta.env.VITE_GMAIL_SYNC_URL || "https://us-central1-pipeline-2f422.cloudfunctions.net/syncGmailTriage";

const sampleSuggestions: EmailSuggestion[] = [
  {
    id: "sample-final",
    kind: "reply",
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
    recommendedAction: "Draft a short reply and keep the thread visible until sent.",
    replyDraft:
      "Hi Professor,\n\nThank you for clarifying. I would like to take the final.\n\nBest,\nSpencer",
  },
  {
    id: "sample-meeting",
    kind: "meeting",
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
    kind: "bill",
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
    taskTitle: "Archive obvious automated inbox noise",
    category: "Admin",
    dueDate: null,
    estimatedLength: 10,
    priorityTier: 8,
    confidence: "Medium",
    recommendedAction: "Archive in batches, never delete by default.",
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

  if (/\b(meeting|calendar|tomorrow|available|join|appointment|call)\b/.test(lower)) return "meeting";
  if (/\b(invoice|statement|payment|billing|fee|charge|due back|late)\b/.test(lower)) return "bill";
  if (/\b(reply|respond|let me know|confirm|question|can you|would you)\b/.test(lower)) return "reply";
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
  if (kind === "bill") return 3;
  if (kind === "reply" || kind === "meeting") return 4;
  if (/\b(newsletter|promo|sale|update|digest|recap)\b/.test(lower)) return 9;
  return 6;
}

function inferCategory(kind: EmailSuggestionKind, text: string) {
  const lower = text.toLowerCase();

  if (/\b(professor|assignment|exam|final|canvas|class|homework)\b/.test(lower)) return "School";
  if (/\b(rent|apartment|lease|landlord|maintenance)\b/.test(lower)) return "Home";
  if (/\b(payment|invoice|statement|card|charge|fee)\b/.test(lower)) return "Finance";
  if (/\b(interview|resume|job|application)\b/.test(lower)) return "Work";
  if (kind === "meeting") return "Calendar";
  return "Admin";
}

function cleanTaskTitle(subject: string, kind: EmailSuggestionKind) {
  const cleaned = subject
    .replace(/^(re|fw|fwd)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (kind === "reply") return `Reply about ${cleaned}`;
  if (kind === "bill") return `Handle ${cleaned}`;
  if (kind === "meeting") return `Prepare for ${cleaned}`;
  return cleaned || "Review imported email";
}

function buildReplyDraft(seed: ParsedEmailSeed) {
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
      : "Imported from Gmail text for review.",
    taskTitle: cleanTaskTitle(seed.subject, kind),
    category: inferCategory(kind, combined),
    dueDate: inferDueDate(combined),
    estimatedLength: kind === "reply" ? 8 : kind === "meeting" ? 15 : kind === "bill" ? 20 : 10,
    priorityTier,
    confidence: kind === "task" ? "Medium" : "High",
    recommendedAction:
      kind === "reply"
        ? "Draft a reply, then decide whether this should become a task."
        : kind === "bill"
          ? "Create a task and keep the email visible until handled."
          : kind === "meeting"
            ? "Create a prep task and check the calendar."
            : "Review once, then task or archive.",
    replyDraft: kind === "reply" ? buildReplyDraft(seed) : undefined,
  };
}

function buildGmailSuggestion(message: GmailSyncMessage, index: number): EmailSuggestion {
  const imported = buildImportedSuggestion(
    {
      from: message.from || "Gmail",
      subject: message.subject || "No subject",
      body: message.snippet || "No preview available.",
    },
    index
  );

  return {
    ...imported,
    id: `gmail-${message.id}`,
    receivedAt: message.receivedAt ? new Date(message.receivedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Gmail",
    summary: message.snippet || imported.summary,
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

function buildTaskDraft(suggestion: EmailSuggestion): TaskDraft {
  return {
    itemKind: suggestion.kind === "bill" || suggestion.dueDate ? "deadline" : "task",
    title: suggestion.taskTitle,
    listName: "Email",
    category: suggestion.category,
    dueDate: suggestion.dueDate,
    estimatedLength: suggestion.estimatedLength,
    priorityTier: suggestion.priorityTier,
    priorityLabel: getPriorityMeta(suggestion.priorityTier).label,
    notes: [
      `From: ${suggestion.from}`,
      `Subject: ${suggestion.subject}`,
      suggestion.summary,
      `Recommended action: ${suggestion.recommendedAction}`,
    ].join("\n"),
    recurring: false,
  };
}

export function EasyListEmailPage() {
  const { addTask, isLoading, error } = useEasyList();
  const [isScanning, setIsScanning] = useState(false);
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const [isGmailSyncing, setIsGmailSyncing] = useState(false);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [gmailConnectedEmail, setGmailConnectedEmail] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, EmailSuggestionState>>({});
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>(sampleSuggestions);
  const [importText, setImportText] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to review a safe sample scan.");

  const visibleSuggestions = useMemo(
    () => suggestions.filter((suggestion) => states[suggestion.id] !== "ignored"),
    [states, suggestions]
  );
  const readyCount = visibleSuggestions.filter((suggestion) => !states[suggestion.id] || states[suggestion.id] === "ready").length;
  const taskCount = Object.values(states).filter((state) => state === "tasked").length;
  const archivedCount = Object.values(states).filter((state) => state === "archived").length;
  const selectedDraft = suggestions.find((suggestion) => suggestion.id === selectedDraftId && suggestion.replyDraft);

  if (isLoading) {
    return <LoadingState label="Loading email triage..." />;
  }

  async function handleScan() {
    setIsScanning(true);
    setStatusMessage("Scanning for direct asks, deadlines, bills, meetings, and safe-to-archive noise...");
    window.setTimeout(() => {
      setStates({});
      setSuggestions(sampleSuggestions);
      setIsScanning(false);
      setStatusMessage("Sample scan ready. Real Gmail sync should land here as a review queue, not auto-save tasks.");
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

  async function handleConnectGmail() {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid === "local-preview") {
      setStatusMessage("Sign in with a real EasyLife account before connecting Gmail.");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
    provider.setCustomParameters({ prompt: "consent" });

    setIsGmailConnecting(true);

    try {
      let result;

      try {
        result = await linkWithPopup(currentUser, provider);
      } catch (linkError) {
        if ((linkError as { code?: string }).code !== "auth/provider-already-linked") {
          throw linkError;
        }
        result = await reauthenticateWithPopup(currentUser, provider);
      }

      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        setStatusMessage("Gmail connected, but Google did not return inbox access. Try reconnecting.");
        return;
      }

      setGmailAccessToken(credential.accessToken);
      setGmailConnectedEmail(result.user.email || currentUser.email || "Connected Gmail");
      setStatusMessage("Gmail connected for this session. Sync will still ask before creating tasks or drafts.");
    } catch (connectError) {
      const code = (connectError as { code?: string }).code || "";
      setStatusMessage(
        code === "auth/credential-already-in-use"
          ? "That Google account is already linked to another EasyLife login."
          : "Gmail connection was not completed."
      );
    } finally {
      setIsGmailConnecting(false);
    }
  }

  async function handleSyncGmail() {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid === "local-preview") {
      setStatusMessage("Sign in with a real EasyLife account before syncing Gmail.");
      return;
    }

    if (!gmailAccessToken) {
      setStatusMessage("Connect Gmail first, then sync.");
      return;
    }

    setIsGmailSyncing(true);
    setStatusMessage("Syncing recent inbox messages into the review queue...");

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(gmailSyncUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: gmailAccessToken,
          query: "in:inbox newer_than:30d -category:promotions",
          maxResults: 20,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error || "Gmail sync failed.");
      }

      const imported: EmailSuggestion[] = Array.isArray(body.messages) ? body.messages.map(buildGmailSuggestion) : [];

      setSuggestions((current) => {
        const existingIds = new Set(current.map((suggestion) => suggestion.id));
        return [...imported.filter((suggestion) => !existingIds.has(suggestion.id)), ...current];
      });
      setStatusMessage(
        imported.length
          ? `Synced ${imported.length} Gmail message${imported.length === 1 ? "" : "s"} into the review queue.`
          : "Gmail synced, but no matching inbox messages were found."
      );
    } catch (syncError) {
      setStatusMessage((syncError as Error).message || "Gmail sync failed. Reconnect and try again.");
    } finally {
      setIsGmailSyncing(false);
    }
  }

  async function handleCreateTask(suggestion: EmailSuggestion) {
    await addTask(buildTaskDraft(suggestion));
    setStates((current) => ({ ...current, [suggestion.id]: "tasked" }));
    setStatusMessage(`Added "${suggestion.taskTitle}" to the Email list.`);
  }

  function handleDraftReply(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "drafted" }));
    setSelectedDraftId(suggestion.id);
    setStatusMessage("Reply drafted for review. Sending should always require approval.");
  }

  function handleArchive(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "archived" }));
    setStatusMessage(`Marked "${suggestion.subject}" as safe to archive.`);
  }

  function handleIgnore(suggestion: EmailSuggestion) {
    setStates((current) => ({ ...current, [suggestion.id]: "ignored" }));
    setStatusMessage(`Dismissed "${suggestion.subject}" from this review.`);
  }

  return (
    <>
      <PageSection
        eyebrow="Email triage"
        title="Turn inbox noise into a short review queue"
        description="Scan for actual obligations, draft replies for approval, archive obvious noise, and send only approved tasks into EasyList."
      >
        <div className="email-triage-hero">
          <div>
            <span className="settings-state-pill">Gmail-ready</span>
            <h2>Review first, then act.</h2>
            <p>
              EasyLife should never spray your inbox into tasks. It should show the likely asks, explain why they matter,
              and wait for your approval before saving, drafting, or archiving.
            </p>
          </div>
          <div className="email-triage-actions">
            <button className="primary-button" type="button" onClick={handleScan} disabled={isScanning}>
              {isScanning ? "Scanning..." : "Scan sample inbox"}
            </button>
            <button className="button-secondary" type="button" onClick={handleConnectGmail} disabled={isGmailConnecting}>
              {gmailAccessToken ? "Reconnect Gmail" : isGmailConnecting ? "Connecting..." : "Connect Gmail"}
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={handleSyncGmail}
              disabled={!gmailAccessToken || isGmailSyncing}
            >
              {isGmailSyncing ? "Syncing..." : "Sync Gmail"}
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
            <span>Tasks made</span>
            <strong>{taskCount}</strong>
          </article>
          <article>
            <span>Archive plan</span>
            <strong>{archivedCount}</strong>
          </article>
        </div>
        <p className="helper-copy">
          {gmailConnectedEmail ? `Connected: ${gmailConnectedEmail}. ` : ""}
          {statusMessage}
        </p>
      </PageSection>

      <PageSection
        eyebrow="Bridge"
        title="Import real Gmail summaries"
        description="Paste one or more email snippets. EasyLife will classify them locally so you can approve tasks, drafts, or archive decisions."
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
              Use separators like three dashes between emails. This stays on-device until a real Gmail sync endpoint is added.
            </span>
            <button className="primary-button" type="button" onClick={handleImportEmails} disabled={!importText.trim()}>
              Import to review
            </button>
          </div>
        </div>
      </PageSection>

      {error ? <p className="error-copy">{error}</p> : null}

      <PageSection eyebrow="Review" title="Suggested inbox actions">
        <div className="email-suggestion-list">
          {visibleSuggestions.map((suggestion) => {
            const state = states[suggestion.id] || "ready";

            return (
              <article className={`email-suggestion-card email-suggestion-card-${state}`} key={suggestion.id}>
                <div className="email-suggestion-meta">
                  <span>{suggestion.kind}</span>
                  <span>{suggestion.confidence} confidence</span>
                  <span>{suggestion.receivedAt}</span>
                </div>
                <div className="email-suggestion-main">
                  <div>
                    <p>{suggestion.from}</p>
                    <h3>{suggestion.subject}</h3>
                    <strong>{suggestion.taskTitle}</strong>
                  </div>
                  <span className="info-pill">{state}</span>
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
                    onClick={() => handleCreateTask(suggestion)}
                    disabled={state === "tasked"}
                  >
                    {state === "tasked" ? "Task added" : "Add task"}
                  </button>
                  {suggestion.replyDraft ? (
                    <button className="button-secondary" type="button" onClick={() => handleDraftReply(suggestion)}>
                      Draft reply
                    </button>
                  ) : null}
                  <button className="button-secondary" type="button" onClick={() => handleArchive(suggestion)}>
                    Archive
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
        <PageSection eyebrow="Draft" title="Reply ready for approval">
          <div className="email-draft-panel">
            <div>
              <span>To</span>
              <strong>{selectedDraft.from}</strong>
            </div>
            <div>
              <span>Subject</span>
              <strong>Re: {selectedDraft.subject}</strong>
            </div>
            <textarea readOnly value={selectedDraft.replyDraft || ""} rows={7} aria-label="Draft reply" />
            <p className="helper-copy">
              The finished integration should create a Gmail draft first and require a second approval before sending.
            </p>
          </div>
        </PageSection>
      ) : null}

      <PageSection eyebrow="Integration plan" title="What the real Gmail connection should do">
        <div className="email-integration-grid">
          <article>
            <span>1</span>
            <strong>Read safely</strong>
            <p>Pull recent unread and important inbox threads, excluding promotions and known notification noise.</p>
          </article>
          <article>
            <span>2</span>
            <strong>Classify</strong>
            <p>Separate tasks, replies, bills, meetings, FYI, and archive-only messages with confidence labels.</p>
          </article>
          <article>
            <span>3</span>
            <strong>Ask first</strong>
            <p>Require approval before creating tasks, archiving, drafting, or sending email.</p>
          </article>
        </div>
      </PageSection>
    </>
  );
}
