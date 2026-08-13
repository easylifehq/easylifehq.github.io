import { useEffect, useSyncExternalStore } from "react";
import { coreLoopDemoNotes } from "@/features/coreloop/demo/coreLoopDemoFixtures";
import { drinkDemoFixtures } from "@/features/easydrinks/demo/drinkDemoFixtures";
import { drinkDemoPantry, drinkDemoPreparations } from "@/features/easydrinks/demo/drinkDepthDemoFixtures";
import type { NoteDraft, NoteRecord } from "@/lib/firestore/notes";
import type { TaskDraft, TaskRecord } from "@/lib/firestore/tasks";
import type { DrinkDraft, DrinkRecord } from "@/lib/firestore/drinks";
import type { DrinkPantryDraft, DrinkPantryItem } from "@/lib/firestore/drinkPantry";
import type { DrinkPreparationDraft, DrinkPreparationRecord } from "@/lib/firestore/drinkPreparations";
import {
  commitSyntheticEnvelope,
  getSyntheticAuditStateStorageKey,
  SYNTHETIC_AUDIT_STATE_VERSION,
} from "./syntheticAuditStorage";
export { getSyntheticAuditStateStorageKey, SYNTHETIC_AUDIT_STATE_PREFIX, SYNTHETIC_AUDIT_STATE_VERSION } from "./syntheticAuditStorage";

const DRINK_SCHEMA_VERSION = "easydrinks-v2" as const;
const DRINK_PANTRY_SCHEMA_VERSION = "easydrinks-pantry-v1" as const;
const DRINK_PREPARATION_SCHEMA_VERSION = "easydrinks-preparation-v1" as const;

export type SyntheticAuditState = {
  version: typeof SYNTHETIC_AUDIT_STATE_VERSION;
  revision: number;
  tasks: TaskRecord[];
  notes: NoteRecord[];
  drinks: DrinkRecord[];
  pantry: DrinkPantryItem[];
  preparations: DrinkPreparationRecord[];
};

const listeners = new Set<() => void>();
let activeKey = "";
let activeState: SyntheticAuditState | null = null;
let synchronizationAttached = false;

function todayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function seedTasks(): TaskRecord[] {
  const today = todayAtMidnight();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const seeds = [
    ["preview-task-1", "Send the project update before lunch", "Keep it short: what moved, what is blocked, and what needs a decision.", "Today", "Work", 18, 2, "Important", today, ["preview-block-1"]],
    ["preview-task-2", "Reply to Maya about Friday plans", "Waiting on a simple yes/no before the day gets noisy.", "Follow-ups", "Personal", 8, 3, "Soon", yesterday, []],
    ["preview-task-3", "Collect three notes for the assistant revamp", "Pull the useful bits from scattered thoughts into one note.", "Projects", "EasyLife", 20, 4, "Focus", today, []],
    ["preview-task-4", "Walk after the 3 PM call", "Small reset before the second work block.", "Health", "Workout", 15, 6, "Nice", null, []],
  ] as const;

  return seeds.map(([id, title, notes, listName, category, estimatedLength, priorityTier, priorityLabel, dueDate, linkedCalendarBlockIds]) => ({
    id,
    itemKind: "task",
    title,
    notes,
    listName,
    category,
    estimatedLength,
    priorityTier,
    priorityLabel,
    dueDate: dueDate ? new Date(dueDate) : null,
    linkedCalendarEventId: null,
    linkedNoteId: null,
    recurring: false,
    completed: false,
    completedAt: null,
    deletedAt: null,
    linkedCalendarBlockIds: [...linkedCalendarBlockIds],
    createdAt: null,
    updatedAt: null,
  }));
}

function cloneDate(value: Date | null) {
  return value ? new Date(value) : null;
}

export function createSeededSyntheticAuditState(revision = 0): SyntheticAuditState {
  return {
    version: SYNTHETIC_AUDIT_STATE_VERSION,
    revision,
    tasks: seedTasks(),
    notes: coreLoopDemoNotes.map((note) => ({
      ...note,
      createdAt: cloneDate(note.createdAt),
      updatedAt: cloneDate(note.updatedAt),
      deletedAt: cloneDate(note.deletedAt),
    })),
    drinks: drinkDemoFixtures.map((drink) => ({
      ...drink,
      ingredients: drink.ingredients.map((ingredient) => ({ ...ingredient })),
      steps: drink.steps.map((step) => ({ ...step })),
      tags: [...drink.tags],
      createdAt: cloneDate(drink.createdAt),
      updatedAt: cloneDate(drink.updatedAt),
    })),
    pantry: drinkDemoPantry.map((item) => ({ ...item, createdAt: cloneDate(item.createdAt), updatedAt: cloneDate(item.updatedAt) })),
    preparations: drinkDemoPreparations.map((record) => ({ ...record, preparedAt: cloneDate(record.preparedAt), createdAt: cloneDate(record.createdAt) })),
  };
}

function toDate(value: unknown) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseSyntheticAuditState(value: string | null): SyntheticAuditState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SyntheticAuditState>;
    if (
      parsed.version !== SYNTHETIC_AUDIT_STATE_VERSION ||
      !Number.isSafeInteger(parsed.revision) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.notes) ||
      !Array.isArray(parsed.drinks) ||
      !Array.isArray(parsed.pantry) ||
      !Array.isArray(parsed.preparations)
    ) return null;

    return {
      version: SYNTHETIC_AUDIT_STATE_VERSION,
      revision: parsed.revision!,
      tasks: parsed.tasks.map((task) => ({ ...task, dueDate: toDate(task.dueDate), completedAt: toDate(task.completedAt), deletedAt: toDate(task.deletedAt), createdAt: toDate(task.createdAt), updatedAt: toDate(task.updatedAt) })),
      notes: parsed.notes.map((note) => ({ ...note, createdAt: toDate(note.createdAt), updatedAt: toDate(note.updatedAt), deletedAt: toDate(note.deletedAt) })),
      drinks: parsed.drinks.map((drink) => ({ ...drink, createdAt: toDate(drink.createdAt), updatedAt: toDate(drink.updatedAt) })),
      pantry: parsed.pantry.map((item) => ({ ...item, createdAt: toDate(item.createdAt), updatedAt: toDate(item.updatedAt) })),
      preparations: parsed.preparations.map((record) => ({ ...record, preparedAt: toDate(record.preparedAt), createdAt: toDate(record.createdAt) })),
    };
  } catch {
    return null;
  }
}

function getRuntimeKey() {
  const hostname = window.location.hostname;
  const isAudit = hostname === "easylife-wave10-1-audit.pages.dev" || hostname.endsWith(".easylife-wave10-1-audit.pages.dev");
  return getSyntheticAuditStateStorageKey({ hostname, mode: isAudit ? "audit" : "loopback-demo" });
}

function initializeRuntimeState() {
  const key = getRuntimeKey();
  if (activeState && activeKey === key) return activeState;
  activeKey = key;
  activeState = parseSyntheticAuditState(window.localStorage.getItem(key)) ?? createSeededSyntheticAuditState();
  return activeState;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function attachSynchronization() {
  if (synchronizationAttached) return;
  synchronizationAttached = true;
  window.addEventListener("storage", (event) => {
    if (!activeKey || event.key !== activeKey) return;
    const next = parseSyntheticAuditState(event.newValue);
    if (!next || (activeState && next.revision <= activeState.revision)) return;
    activeState = next;
    emit();
  });
}

const disabledSnapshot = createSeededSyntheticAuditState();

export function useSyntheticAuditState(enabled: boolean) {
  useEffect(() => {
    if (enabled) attachSynchronization();
  }, [enabled]);
  return useSyncExternalStore(
    enabled ? subscribe : () => () => undefined,
    enabled ? initializeRuntimeState : () => disabledSnapshot,
    () => disabledSnapshot,
  );
}

function commit(updater: (current: SyntheticAuditState) => SyntheticAuditState) {
  const current = initializeRuntimeState();
  const next = commitSyntheticEnvelope(window.localStorage, activeKey, current, updater);
  activeState = next;
  emit();
  return next;
}

function nextId(prefix: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function taskFromDraft(id: string, draft: TaskDraft, createdAt = new Date()): TaskRecord {
  const dueDate = draft.dueDate ? new Date(`${draft.dueDate}T00:00:00`) : null;
  return {
    id,
    itemKind: draft.itemKind || "task",
    title: draft.title,
    notes: draft.notes,
    listName: draft.listName?.trim() || "Inbox",
    category: draft.category,
    estimatedLength: draft.estimatedLength,
    priorityTier: draft.priorityTier,
    priorityLabel: draft.priorityLabel,
    dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
    linkedCalendarEventId: draft.linkedCalendarEventId || null,
    linkedNoteId: draft.linkedNoteId || null,
    recurring: Boolean(draft.recurring),
    completed: false,
    completedAt: null,
    deletedAt: null,
    linkedCalendarBlockIds: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export async function createSyntheticTask(draft: TaskDraft) {
  const id = nextId("audit-task");
  const record = taskFromDraft(id, draft);
  commit((state) => ({ ...state, tasks: [record, ...state.tasks] }));
  return id;
}

export async function updateSyntheticTask(taskId: string, draft: TaskDraft) {
  commit((state) => ({ ...state, tasks: state.tasks.map((task) => task.id === taskId ? { ...taskFromDraft(task.id, draft, task.createdAt || new Date()), completed: task.completed, completedAt: task.completedAt, deletedAt: task.deletedAt, linkedCalendarBlockIds: task.linkedCalendarBlockIds, updatedAt: new Date() } : task) }));
}

export async function setSyntheticTaskComplete(taskId: string, completed: boolean) {
  const now = new Date();
  commit((state) => ({ ...state, tasks: state.tasks.map((task) => task.id === taskId ? { ...task, completed, completedAt: completed ? now : null, updatedAt: now } : task) }));
}

export async function setSyntheticTaskDeleted(taskId: string, deleted: boolean) {
  const now = new Date();
  commit((state) => ({ ...state, tasks: state.tasks.map((task) => task.id === taskId ? { ...task, deletedAt: deleted ? now : null, updatedAt: now } : task) }));
}

export async function removeSyntheticTask(taskId: string) {
  commit((state) => ({ ...state, tasks: state.tasks.filter((task) => task.id !== taskId) }));
}

export async function createSyntheticNote(draft?: NoteDraft) {
  const id = nextId("audit-note");
  const now = new Date();
  const record: NoteRecord = {
    id,
    title: draft?.title || "",
    tags: draft?.tags || [],
    folderId: draft?.folderId || "",
    pinned: Boolean(draft?.pinned),
    bodyHtml: "",
    bodyText: draft?.bodyText || "",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  commit((state) => ({ ...state, notes: [record, ...state.notes] }));
  return id;
}

export async function updateSyntheticNote(noteId: string, draft: NoteDraft) {
  commit((state) => ({ ...state, notes: state.notes.map((note) => note.id === noteId ? { ...note, ...draft, tags: [...draft.tags], updatedAt: new Date() } : note) }));
}

export async function setSyntheticNotesDeleted(noteIds: string[], deleted: boolean) {
  const now = new Date();
  commit((state) => ({ ...state, notes: state.notes.map((note) => noteIds.includes(note.id) ? { ...note, deletedAt: deleted ? now : null, updatedAt: now } : note) }));
}

export async function removeSyntheticNotes(noteIds: string[]) {
  commit((state) => ({ ...state, notes: state.notes.filter((note) => !noteIds.includes(note.id)) }));
}

export async function moveSyntheticNotes(noteIds: string[], folderId: string) {
  commit((state) => ({ ...state, notes: state.notes.map((note) => noteIds.includes(note.id) ? { ...note, folderId, updatedAt: new Date() } : note) }));
}

export async function createSyntheticDrink(draft: DrinkDraft) {
  const id = nextId("audit-drink");
  const now = new Date();
  const record: DrinkRecord = { id, ownerId: "local-preview", schemaVersion: DRINK_SCHEMA_VERSION, ...draft, createdAt: now, updatedAt: now };
  commit((state) => ({ ...state, drinks: [record, ...state.drinks] }));
  return id;
}

export async function updateSyntheticDrink(drinkId: string, draft: DrinkDraft) {
  commit((state) => ({ ...state, drinks: state.drinks.map((drink) => drink.id === drinkId ? { ...drink, ...draft, schemaVersion: DRINK_SCHEMA_VERSION, updatedAt: new Date() } : drink) }));
}

export async function createSyntheticPantryItem(draft: DrinkPantryDraft) {
  const id = nextId("audit-pantry");
  const now = new Date();
  const record: DrinkPantryItem = { id, ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, ...draft, createdAt: now, updatedAt: now };
  commit((state) => ({ ...state, pantry: [...state.pantry, record].sort((a, b) => a.name.localeCompare(b.name)) }));
  return id;
}

export async function updateSyntheticPantryItem(itemId: string, draft: DrinkPantryDraft) {
  commit((state) => ({ ...state, pantry: state.pantry.map((item) => item.id === itemId ? { ...item, ...draft, updatedAt: new Date() } : item).sort((a, b) => a.name.localeCompare(b.name)) }));
}

export async function removeSyntheticPantryItem(itemId: string) {
  commit((state) => ({ ...state, pantry: state.pantry.filter((item) => item.id !== itemId) }));
}

export async function createSyntheticPreparation(draft: DrinkPreparationDraft) {
  const id = nextId("audit-preparation");
  const now = new Date();
  const record: DrinkPreparationRecord = { id, ownerId: "local-preview", schemaVersion: DRINK_PREPARATION_SCHEMA_VERSION, ...draft, preparedAt: now, createdAt: now };
  commit((state) => ({ ...state, preparations: [record, ...state.preparations] }));
  return id;
}

export async function removeSyntheticPreparation(preparationId: string) {
  commit((state) => ({ ...state, preparations: state.preparations.filter((record) => record.id !== preparationId) }));
}

export function resetSyntheticAuditState() {
  const current = initializeRuntimeState();
  const next = createSeededSyntheticAuditState(current.revision + 1);
  window.localStorage.setItem(activeKey, JSON.stringify(next));
  activeState = next;
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (
      key?.startsWith("easylife:easygames:active:v2:local-preview:") ||
      key === "easylife:easygames:outbox:v1:local-preview" ||
      key?.startsWith("easylife:drinks:guided:v1:local-preview:")
    ) window.localStorage.removeItem(key);
  }
  emit();
  window.dispatchEvent(new CustomEvent("easylife:synthetic-audit-reset"));
}

export function __resetSyntheticAuditStateForTests() {
  activeKey = "";
  activeState = null;
  synchronizationAttached = false;
  listeners.clear();
}
