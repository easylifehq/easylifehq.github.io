import { useMemo, useState, type FormEvent } from "react";
import type { TaskDraft } from "@/lib/firestore/tasks";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import { auth } from "@/lib/firebase/client";

type TaskComposerProps = {
  onSubmit: (draft: TaskDraft) => Promise<void>;
};

type TaskRowDraft = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  estimatedLength: string;
  priorityTier: 1 | 2 | 3 | 4 | 5;
  notes: string;
};

type AiTaskRow = {
  title: string;
  category?: string;
  dueDate?: string | null;
  estimatedLength?: number | null;
  priorityTier?: number;
  notes?: string;
};

const EMPTY_ROW = (): TaskRowDraft => ({
  id: crypto.randomUUID(),
  title: "",
  category: "",
  dueDate: "",
  estimatedLength: "",
  priorityTier: 3,
  notes: "",
});

function buildTaskDraft(row: TaskRowDraft): TaskDraft | null {
  if (!row.title.trim()) {
    return null;
  }

  return {
    title: row.title.trim(),
    category: row.category.trim(),
    dueDate: row.dueDate || null,
    estimatedLength: row.estimatedLength ? Number(row.estimatedLength) : null,
    priorityTier: row.priorityTier,
    priorityLabel: getPriorityMeta(row.priorityTier).label,
    notes: row.notes.trim(),
    recurring: false,
  };
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseWeekdayDueDate(text: string, now: Date) {
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const match = text.toLowerCase().match(/\b(next\s+)?(sun|mon|tues?|wed|thu(?:rs)?|fri|sat)(?:day)?\b/);
  if (!match) return "";

  const dayPrefix = match[2];
  const targetIndex = weekdays.findIndex((weekday) => weekday.startsWith(dayPrefix.replace(/^tues?$/, "tue").replace(/^thu(?:rs)?$/, "thu")));
  if (targetIndex < 0) return "";

  const currentIndex = now.getDay();
  let daysUntil = (targetIndex - currentIndex + 7) % 7;
  if (daysUntil === 0 || match[1]) {
    daysUntil += 7;
  }

  return toDateInputValue(addDays(now, daysUntil));
}

function parseDueDate(text: string, now = new Date()) {
  const lower = text.toLowerCase();
  const isoMatch = lower.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const parsed = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(parsed.getTime()) ? "" : toDateInputValue(parsed);
  }

  const slashMatch = lower.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (slashMatch) {
    const year = slashMatch[3]
      ? Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3])
      : now.getFullYear();
    const parsed = new Date(year, Number(slashMatch[1]) - 1, Number(slashMatch[2]));
    return Number.isNaN(parsed.getTime()) ? "" : toDateInputValue(parsed);
  }

  if (/\b(today|tonight|eod)\b/.test(lower)) return toDateInputValue(now);
  if (/\b(tomorrow|tmrw|tmr)\b/.test(lower)) return toDateInputValue(addDays(now, 1));
  if (/\bnext week\b/.test(lower)) return toDateInputValue(addDays(now, 7));
  if (/\bthis weekend\b/.test(lower)) {
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    return toDateInputValue(addDays(now, daysUntilSaturday));
  }

  return parseWeekdayDueDate(lower, now);
}

function parseDurationMinutes(text: string) {
  const hourMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  if (hourMatch) {
    return String(Math.round(Number(hourMatch[1]) * 60));
  }

  const minuteMatch = text.match(/\b(\d+)\s*(?:minutes?|mins?|min|m)\b/i);
  return minuteMatch ? minuteMatch[1] : "";
}

function parsePriorityTier(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|emergency|critical|highest|p1|priority 1|must do)\b/.test(lower)) return 1;
  if (/\b(high|important|soon|p2|priority 2)\b/.test(lower)) return 2;
  if (/\b(low|whenever|someday|eventually|p5|priority 5)\b/.test(lower)) return 5;
  if (/\b(backlog|nice to have|p4|priority 4)\b/.test(lower)) return 4;
  return 3;
}

function parseCategory(text: string, fallback = "") {
  const tagMatch = text.match(/#([a-z][\w-]*)/i);
  if (tagMatch) return tagMatch[1].replace(/[-_]/g, " ");

  const bracketMatch = text.match(/^\s*\[([^[\]]{2,24})\]\s*/);
  if (bracketMatch) return bracketMatch[1].trim();

  const categoryMatch = text.match(/\b(?:category|cat|project|area)\s*[:=]\s*([a-z][\w -]{1,24})/i);
  if (categoryMatch) return categoryMatch[1].trim();

  const lower = text.toLowerCase();
  if (/\b(class|homework|assignment|professor|exam|study|school)\b/.test(lower)) return "School";
  if (/\b(work|client|boss|meeting|email|slack|application|resume|interview)\b/.test(lower)) return "Work";
  if (/\b(gym|lift|workout|run|cardio|legs|push|pull)\b/.test(lower)) return "Gym";
  if (/\b(groceries|errand|pharmacy|laundry|clean|dishes|apartment)\b/.test(lower)) return "Personal";
  if (/\b(call|text|friend|family|dinner|hangout)\b/.test(lower)) return "Social";

  return fallback;
}

function cleanTaskTitle(text: string) {
  return text
    .replace(/^\s*(?:[-*+]|[0-9]+[.)])\s*/, "")
    .replace(/^\s*\[[ xX]\]\s*/, "")
    .replace(/^\s*\[[^[\]]{2,24}\]\s*/, "")
    .replace(/^\s*(?:I\s+)?(?:also\s+)?(?:probably\s+)?(?:really\s+)?(?:need|have|should)\s+to\s+/i, "")
    .replace(/^\s*(?:I\s+)?(?:also\s+)?(?:probably\s+)?should\s+/i, "")
    .replace(/^\s*(?:and\s+)?(?:also\s+)?(?:maybe|probably)\s+/i, "")
    .replace(/\b(?:due|by)\s+(?:today|tonight|tomorrow|tmrw|tmr|next week|this weekend|sun(?:day)?|mon(?:day)?|tues?(?:day)?|wed(?:nesday)?|thu(?:rs)?(?:day)?|fri(?:day)?|sat(?:urday)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|20\d{2}-\d{1,2}-\d{1,2})\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|min|m)\b/gi, "")
    .replace(/\b(?:urgent|asap|important|high priority|low priority|p[1-5]|priority [1-5])\b/gi, "")
    .replace(/\b(?:category|cat|project|area)\s*[:=]\s*[a-z][\w -]{1,24}/gi, "")
    .replace(/#([a-z][\w-]*)/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

const ACTION_START_PATTERN =
  /\b(?:email|text|call|send|follow up|update|make|buy|clean|study|finish|start|schedule|review|submit|pick|get|write|read|pay|book|plan|prepare|organize|check|create|draft)\b/i;

function hasActionIntent(text: string) {
  const lower = text.toLowerCase();
  return (
    ACTION_START_PATTERN.test(lower) ||
    /\b(?:need|needs|needed|have|should|remember|forgot|forgetting)\s+(?:to\s+)?\w+/i.test(lower)
  );
}

function removeIntroFluff(text: string) {
  const actionMatch = text.match(
    /\b(?:I\s+(?:also\s+)?(?:probably\s+|maybe\s+|really\s+)?(?:need|have)\s+to|I\s+(?:also\s+)?(?:probably\s+|maybe\s+)?should|(?:email|text|call|send|follow up|update|make|buy|clean|study|finish|start|schedule|review|submit|pick|get|write|read|pay|book|plan|prepare|organize|check|create|draft)\b)/i
  );

  return actionMatch && actionMatch.index !== undefined ? text.slice(actionMatch.index).trim() : text.trim();
}

function splitBrainDumpIntoCandidates(text: string) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[\u2022\u2013\u2014]/g, "-")
    .replace(/\.\s+(?=I\s+(?:also\s+)?(?:probably\s+|maybe\s+|really\s+)?(?:need|have)\s+to\b)/gi, "\n")
    .replace(/\.\s+(?=I\s+(?:also\s+)?(?:probably\s+|maybe\s+)?should\b)/gi, "\n")
    .replace(/\b(?:and\s+)?I\s+should\s+/gi, "\n")
    .replace(/\b(?:and\s+)?I\s+(?:also\s+)?(?:really\s+)?need\s+to\s+/gi, "\n")
    .replace(/\b(?:and\s+)?I\s+(?:probably\s+|maybe\s+)?need\s+to\s+/gi, "\n")
    .replace(/\b(?:and\s+)?I\s+(?:probably\s+|maybe\s+)?have\s+to\s+/gi, "\n")
    .replace(/\b(?:and\s+)?maybe\s+/gi, "\n")
    .replace(/\bAt home I need to\s+/gi, "\n")
    .replace(/\s+and then\s+/gi, "\n")
    .replace(/,\s+(?=(?:email|text|call|send|follow up|update|make|buy|clean|study|finish|start|schedule|review|submit|pick|get)\b)/gi, "\n")
    .replace(/,\s+and\s+(?=(?:email|text|call|send|follow up|update|make|buy|clean|study|finish|start|schedule|review|submit|pick|get)\b)/gi, "\n")
    .replace(/\s*;\s*/g, "\n");

  const firstPass = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return firstPass.flatMap((line) => {
    if (/^\s*(?:[-*+]|[0-9]+[.)])\s+/.test(line)) return [line];
    if (line.length < 90) return [removeIntroFluff(line)];

    return line
      .split(/(?<=[.!?])\s+|,\s+(?=(?:and\s+)?(?:email|text|call|send|follow up|update|make|buy|clean|study|finish|start|schedule|review|submit|pick|get|write|read|pay|book|plan|prepare|organize|check|create|draft)\b)/i)
      .map((candidate) => candidate.trim())
      .map(removeIntroFluff)
      .filter(Boolean);
  });
}

function parseBrainDump(text: string): TaskRowDraft[] {
  let contextCategory = "";

  return splitBrainDumpIntoCandidates(text)
    .reduce<TaskRowDraft[]>((accumulator, rawLine) => {
      const line = rawLine.replace(/^\s*[-*+]?\s*(\[[ xX]\])?\s*/, "").trim();
      const looksLikeHeading = /:$/.test(line) && line.split(/\s+/).length <= 5;

      if (looksLikeHeading) {
        contextCategory = line.replace(/:$/, "").trim();
        return accumulator;
      }

      const [main, ...noteParts] = line.split(/\s+\|\s+|\s+-\s+/);
      const title = cleanTaskTitle(main || line);
      if (!title || !hasActionIntent(line) || title.length > 140) return accumulator;

      const notes = noteParts.join(" - ").trim();

      accumulator.push({
        ...EMPTY_ROW(),
        title,
        category: parseCategory(line, contextCategory),
        dueDate: parseDueDate(line),
        estimatedLength: parseDurationMinutes(line),
        priorityTier: parsePriorityTier(line),
        notes,
      });

      return accumulator;
    }, [])
    .slice(0, 20);
}

function normalizeAiTaskRows(rows: AiTaskRow[]): TaskRowDraft[] {
  return rows
    .map((row) => {
      const priorityTier = Number(row.priorityTier);

      return {
        ...EMPTY_ROW(),
        title: String(row.title || "").trim(),
        category: String(row.category || "").trim(),
        dueDate: typeof row.dueDate === "string" ? row.dueDate : "",
        estimatedLength:
          typeof row.estimatedLength === "number" && row.estimatedLength > 0
            ? String(row.estimatedLength)
            : "",
        priorityTier: ([1, 2, 3, 4, 5].includes(priorityTier) ? priorityTier : 3) as 1 | 2 | 3 | 4 | 5,
        notes: String(row.notes || "").trim(),
      };
    })
    .filter((row) => row.title)
    .slice(0, 20);
}

async function analyzeBrainDumpWithAi(brainDump: string) {
  const endpoint = import.meta.env.VITE_TASK_ANALYZER_URL;
  const user = auth.currentUser;

  if (!endpoint || !user) {
    return null;
  }

  const token = await user.getIdToken();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brainDump,
      currentDate: toDateInputValue(new Date()),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "AI task analysis failed.");
  }

  return normalizeAiTaskRows(Array.isArray(payload?.rows) ? payload.rows : []);
}

export function TaskComposer({ onSubmit }: TaskComposerProps) {
  const [rows, setRows] = useState<TaskRowDraft[]>([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [brainDump, setBrainDump] = useState("");
  const [mergeMode, setMergeMode] = useState<"replace" | "append">("replace");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const readyCount = useMemo(
    () => rows.filter((row) => row.title.trim()).length,
    [rows]
  );

  function updateRow(rowId: string, field: keyof TaskRowDraft, value: string | number) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function addBlankRow() {
    setRows((current) => [...current, EMPTY_ROW()]);
  }

  function removeRow(rowId: string) {
    setRows((current) => {
      if (current.length === 1) {
        return [EMPTY_ROW()];
      }

      return current.filter((row) => row.id !== rowId);
    });
  }

  function applyParsedRows(parsedRows: TaskRowDraft[]) {
    if (!parsedRows.length) {
      return;
    }

    if (mergeMode === "replace") {
      setRows([
        ...parsedRows,
        ...Array.from({ length: Math.max(1, 3 - parsedRows.length) }, () => EMPTY_ROW()),
      ]);
      return;
    }

    setRows((current) => {
      const emptySlots = current.filter((row) => !row.title.trim());
      const filled = current.filter((row) => row.title.trim());
      const replacement = [...filled, ...parsedRows];
      const neededPadding = Math.max(1, emptySlots.length) - parsedRows.length;

      return [
        ...replacement,
        ...Array.from({ length: Math.max(neededPadding, 1) }, () => EMPTY_ROW()),
      ];
    });
  }

  async function handleBrainDumpToRows() {
    if (!brainDump.trim()) return;

    setIsAnalyzing(true);
    setAnalysisMessage("");

    try {
      const aiRows = await analyzeBrainDumpWithAi(brainDump);
      const parsedRows = aiRows?.length ? aiRows : parseBrainDump(brainDump);
      applyParsedRows(parsedRows);
      setAnalysisMessage(
        aiRows?.length
          ? "AI turned this into editable rows."
          : "AI was unavailable, so local analysis created editable rows."
      );
    } catch (error) {
      const parsedRows = parseBrainDump(brainDump);
      applyParsedRows(parsedRows);
      setAnalysisMessage(
        error instanceof Error
          ? `${error.message} Local analysis created editable rows instead.`
          : "Used local analysis instead."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const drafts = rows.map(buildTaskDraft).filter(Boolean) as TaskDraft[];
    if (!drafts.length) return;

    setIsSubmitting(true);

    try {
      for (const draft of drafts) {
        await onSubmit(draft);
      }

      setRows([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
      setBrainDump("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="task-composer" onSubmit={handleSubmit}>
      <div className="brain-dump-card">
        <label className="field-stack">
          <span>Brain dump</span>
          <textarea
            value={brainDump}
            onChange={(event) => setBrainDump(event.target.value)}
            rows={5}
            placeholder="Ramble here. Example: I need to email my professor tomorrow because the assignment is late, probably study bio for 45 minutes before Thursday, and sometime this weekend I should buy groceries and clean the apartment."
          />
        </label>

        <div className="brain-dump-actions">
          <div className="brain-dump-mode-toggle" aria-label="Brain dump row behavior">
            <button
              type="button"
              className={`toggle-button${mergeMode === "replace" ? " active" : ""}`}
              onClick={() => setMergeMode("replace")}
            >
              Replace rows
            </button>
            <button
              type="button"
              className={`toggle-button${mergeMode === "append" ? " active" : ""}`}
              onClick={() => setMergeMode("append")}
            >
              Add to existing
            </button>
          </div>
          <button
            type="button"
            className="button-secondary"
            onClick={handleBrainDumpToRows}
            disabled={isAnalyzing || !brainDump.trim()}
          >
            {isAnalyzing ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                Reading your brain dump...
              </>
            ) : (
              "AI Analyze Into Rows"
            )}
          </button>
          <span className="helper-copy">
            {isAnalyzing
              ? "AI is finding the actual tasks and turning them into rows."
              : analysisMessage || "Paste a messy paragraph. AI will pull out editable task rows."}
          </span>
        </div>
      </div>

      <div className="task-rows-shell">
        <div className="task-row-grid task-row-grid-header" aria-hidden="true">
          <span>Task</span>
          <span>Category</span>
          <span>Due</span>
          <span>Minutes</span>
          <span>Priority</span>
          <span>Notes</span>
          <span>Actions</span>
        </div>

        {rows.map((row, index) => (
          <div key={row.id} className="task-row-grid task-row-card">
            <label className="field-stack task-row-field">
              <span>Task</span>
              <input
                type="text"
                value={row.title}
                onChange={(event) => updateRow(row.id, "title", event.target.value)}
                placeholder={`Task ${index + 1}`}
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Category</span>
              <input
                type="text"
                value={row.category}
                onChange={(event) => updateRow(row.id, "category", event.target.value)}
                placeholder="Personal"
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Due</span>
              <input
                type="date"
                value={row.dueDate}
                onChange={(event) => updateRow(row.id, "dueDate", event.target.value)}
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Minutes</span>
              <input
                type="number"
                min="0"
                step="5"
                value={row.estimatedLength}
                onChange={(event) => updateRow(row.id, "estimatedLength", event.target.value)}
                placeholder="30"
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Priority</span>
              <select
                value={row.priorityTier}
                onChange={(event) =>
                  updateRow(row.id, "priorityTier", Number(event.target.value))
                }
              >
                {[1, 2, 3, 4, 5].map((tier) => (
                  <option key={tier} value={tier}>
                    {getPriorityMeta(tier).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-stack task-row-field">
              <span>Notes</span>
              <input
                type="text"
                value={row.notes}
                onChange={(event) => updateRow(row.id, "notes", event.target.value)}
                placeholder="Optional context"
              />
            </label>

            <div className="task-row-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => removeRow(row.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="task-composer-actions">
        <button type="button" className="button-secondary" onClick={addBlankRow}>
          Add Row
        </button>
        <button type="submit" className="primary-button" disabled={isSubmitting || readyCount === 0}>
          {isSubmitting ? "Saving..." : `Add ${readyCount || ""} Task${readyCount === 1 ? "" : "s"}`.trim()}
        </button>
      </div>
    </form>
  );
}
