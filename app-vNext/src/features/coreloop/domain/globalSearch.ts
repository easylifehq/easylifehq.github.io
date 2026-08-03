export type CoreSearchGroup = "Commands" | "Notes" | "People" | "Projects" | "Job applications" | "Plan" | "Workouts";

export type CoreSearchDocument = {
  id: string;
  group: Exclude<CoreSearchGroup, "Commands">;
  title: string;
  detail: string;
  searchText: string;
  to: string;
  updatedAt?: Date | null;
};

export type CoreSearchResult = CoreSearchDocument & { score: number };

export const CORE_LOOP_COMMANDS = [
  { id: "capture", label: "Capture", detail: "Save a raw thought to Inbox", keywords: "inbox quick add", action: "capture" as const },
  { id: "new-note", label: "New note", detail: "Open a blank note", keywords: "write notes", to: "/app/easynotes/new" },
  { id: "today", label: "Today", detail: "Return to the one owning action", keywords: "home hq", to: "/app/hq" },
  { id: "my-week", label: "My Week", detail: "Review the week or start the focused queue", keywords: "weekly review progress", to: "/app/easystatistics?tab=week" },
  { id: "plan", label: "Plan", detail: "Schedule work deliberately", keywords: "calendar day schedule", to: "/app/easycalendar/day" },
  { id: "workout", label: "Start or resume a workout", detail: "Open the workout logger and restore any saved draft", keywords: "exercise gym training", to: "/app/easyworkout/log?workoutMode=1" },
  { id: "settings", label: "Settings", detail: "Preferences, export, and account controls", keywords: "data export account", to: "/app/settings" },
] as const;

const groupOrder: CoreSearchDocument["group"][] = ["Notes", "People", "Projects", "Job applications", "Plan", "Workouts"];

function normalized(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export function searchCoreLoopDocuments(documents: CoreSearchDocument[], query: string, limit = 36): CoreSearchResult[] {
  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return documents
    .map((document) => {
      const title = normalized(document.title);
      const detail = normalized(document.detail);
      const haystack = normalized(`${document.title} ${document.detail} ${document.searchText}`);
      if (!terms.every((term) => haystack.includes(term))) return null;

      const titleStarts = terms.every((term) => title.startsWith(term));
      const titleMatches = terms.every((term) => title.includes(term));
      const detailMatches = terms.every((term) => detail.includes(term));
      const score = (titleStarts ? 0 : titleMatches ? 10 : detailMatches ? 20 : 30) + groupOrder.indexOf(document.group);
      return { ...document, score };
    })
    .filter((result): result is CoreSearchResult => Boolean(result))
    .sort((left, right) =>
      left.score - right.score ||
      (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0) ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id)
    )
    .slice(0, Math.max(1, limit));
}

export function filterCoreLoopCommands(query: string) {
  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [...CORE_LOOP_COMMANDS];
  return CORE_LOOP_COMMANDS.filter((command) => {
    const haystack = normalized(`${command.label} ${command.detail} ${command.keywords}`);
    return terms.every((term) => haystack.includes(term));
  });
}

export function movePaletteIndex(current: number, direction: 1 | -1, count: number) {
  if (count <= 0) return -1;
  if (current < 0) return direction === 1 ? 0 : count - 1;
  return (current + direction + count) % count;
}

type ShortcutInput = { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; key: string };

export function isGlobalSearchShortcut(event: ShortcutInput) {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLocaleLowerCase() === "k";
}

export function isCaptureShortcut(event: ShortcutInput) {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLocaleLowerCase() === "k";
}

export function getSearchPresentationState(input: {
  query: string;
  isLoading: boolean;
  errors: string[];
  isOnline: boolean;
  resultCount: number;
}) {
  if (!input.isOnline) return "offline" as const;
  if (input.isLoading && input.resultCount === 0) return "loading" as const;
  if (input.errors.length) return "partial-error" as const;
  if (input.query.trim() && input.resultCount === 0) return "empty" as const;
  return "ready" as const;
}
