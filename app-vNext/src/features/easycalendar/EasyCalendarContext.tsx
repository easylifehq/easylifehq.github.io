import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import {
  createCalendarEvent,
  removeCalendarEvent,
  subscribeToCalendarEvents,
  updateCalendarEvent,
  type CalendarEventDraft,
  type CalendarEventRecord,
} from "@/lib/firestore/calendarEvents";
import {
  createCalendarTaskBlock,
  markCalendarTaskBlocksActive,
  markCalendarTaskBlocksComplete,
  removeCalendarTaskBlock,
  subscribeToCalendarTaskBlocks,
  updateCalendarTaskBlock,
  type CalendarTaskBlockDraft,
  type CalendarTaskBlockRecord,
} from "@/lib/firestore/calendarTaskBlocks";
import {
  createCategory,
  removeCategory,
  subscribeToCategories,
  updateCategory,
  type CategoryDraft,
  type CategoryRecord,
} from "@/lib/firestore/categories";
import {
  addLinkedCalendarBlock,
  completeTask,
  createTask,
  removeLinkedCalendarBlock,
  reopenTask,
  subscribeToTasks,
  type TaskDraft,
  type TaskRecord,
} from "@/lib/firestore/tasks";

type EasyCalendarContextValue = {
  categories: CategoryRecord[];
  events: CalendarEventRecord[];
  taskBlocks: CalendarTaskBlockRecord[];
  tasks: TaskRecord[];
  isLoading: boolean;
  error: string;
  addEvent: (draft: CalendarEventDraft) => Promise<string | null>;
  addTask: (draft: TaskDraft) => Promise<string | null>;
  saveEvent: (eventId: string, draft: CalendarEventDraft) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addTaskBlock: (draft: CalendarTaskBlockDraft) => Promise<void>;
  saveTaskBlock: (blockId: string, draft: CalendarTaskBlockDraft) => Promise<void>;
  deleteTaskBlock: (blockId: string, taskId?: string) => Promise<void>;
  addCategory: (draft: CategoryDraft) => Promise<void>;
  saveCategory: (categoryId: string, draft: CategoryDraft) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  scheduleTask: (
    task: TaskRecord,
    draft: Pick<CalendarTaskBlockDraft, "startAt" | "endAt" | "planningState" | "userAdjusted">
  ) => Promise<string | null>;
  completeTaskFromCalendar: (taskId: string) => Promise<void>;
  reopenTaskFromCalendar: (taskId: string) => Promise<void>;
};

const EasyCalendarContext = createContext<EasyCalendarContextValue | undefined>(
  undefined
);

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

function todayAt(hours: number, minutes = 0) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getPreviewTasks(): TaskRecord[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  return [
    {
      id: "preview-task-1",
      itemKind: "task",
      title: "Send the project update before lunch",
      notes: "Keep it short: what moved, what is blocked, and what needs a decision.",
      listName: "Today",
      category: "Work",
      estimatedLength: 18,
      priorityTier: 2,
      priorityLabel: "Important",
      dueDate: todayAt(0),
      linkedCalendarEventId: null,
      linkedNoteId: null,
      recurring: false,
      completed: false,
      completedAt: null,
      deletedAt: null,
      linkedCalendarBlockIds: ["preview-block-1"],
      createdAt: null,
      updatedAt: null,
    },
    {
      id: "preview-task-2",
      itemKind: "task",
      title: "Reply to Maya about Friday plans",
      notes: "Waiting on a simple yes/no before the day gets noisy.",
      listName: "Follow-ups",
      category: "Personal",
      estimatedLength: 8,
      priorityTier: 3,
      priorityLabel: "Soon",
      dueDate: yesterday,
      linkedCalendarEventId: null,
      linkedNoteId: null,
      recurring: false,
      completed: false,
      completedAt: null,
      deletedAt: null,
      linkedCalendarBlockIds: [],
      createdAt: null,
      updatedAt: null,
    },
    {
      id: "preview-task-3",
      itemKind: "task",
      title: "Collect three notes for the assistant revamp",
      notes: "Pull the useful bits from scattered thoughts into one note.",
      listName: "Projects",
      category: "EasyLife",
      estimatedLength: 20,
      priorityTier: 4,
      priorityLabel: "Focus",
      dueDate: todayAt(0),
      linkedCalendarEventId: null,
      linkedNoteId: null,
      recurring: false,
      completed: false,
      completedAt: null,
      deletedAt: null,
      linkedCalendarBlockIds: [],
      createdAt: null,
      updatedAt: null,
    },
    {
      id: "preview-task-4",
      itemKind: "task",
      title: "Walk after the 3 PM call",
      notes: "Small reset before the second work block.",
      listName: "Health",
      category: "Workout",
      estimatedLength: 15,
      priorityTier: 6,
      priorityLabel: "Nice",
      dueDate: null,
      linkedCalendarEventId: null,
      linkedNoteId: null,
      recurring: false,
      completed: false,
      completedAt: null,
      deletedAt: null,
      linkedCalendarBlockIds: [],
      createdAt: null,
      updatedAt: null,
    },
  ];
}

function getPreviewEvents(): CalendarEventRecord[] {
  return [
    {
      id: "preview-event-1",
      title: "Team standup",
      description: "Quick follow-ups and calendar prep.",
      itemKind: "event",
      categoryId: "work",
      startAt: todayAt(10, 0),
      endAt: todayAt(10, 30),
      allDay: false,
      isRecurring: false,
      recurrenceRule: null,
      eventType: "work",
      linkedTaskId: null,
      createdAt: null,
      updatedAt: null,
    },
    {
      id: "preview-event-2",
      title: "Deep work block",
      description: "Quiet build time.",
      itemKind: "event",
      categoryId: "work",
      startAt: todayAt(13, 0),
      endAt: todayAt(14, 30),
      allDay: false,
      isRecurring: false,
      recurrenceRule: null,
      eventType: "work",
      linkedTaskId: null,
      createdAt: null,
      updatedAt: null,
    },
    {
      id: "preview-event-3",
      title: "Check-in call",
      description: "Decision and next steps.",
      itemKind: "event",
      categoryId: "personal",
      startAt: todayAt(15, 0),
      endAt: todayAt(15, 25),
      allDay: false,
      isRecurring: false,
      recurrenceRule: null,
      eventType: "appointment",
      linkedTaskId: null,
      createdAt: null,
      updatedAt: null,
    },
  ];
}

function getPreviewTaskBlocks(): CalendarTaskBlockRecord[] {
  return [
    {
      id: "preview-block-1",
      taskId: "preview-task-1",
      titleSnapshot: "Send the project update before lunch",
      categoryId: "Work",
      startAt: todayAt(11, 0),
      endAt: todayAt(11, 25),
      isFlexible: true,
      planningState: "scheduled",
      userAdjusted: true,
      completed: false,
      completedAt: null,
      createdAt: null,
      updatedAt: null,
    },
  ];
}

export function EasyCalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [events, setEvents] = useState<CalendarEventRecord[]>([]);
  const [taskBlocks, setTaskBlocks] = useState<CalendarTaskBlockRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [taskBlocksLoading, setTaskBlocksLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisualQaMode()) {
      setCategories([]);
      setEvents(getPreviewEvents());
      setTaskBlocks(getPreviewTaskBlocks());
      setTasks(getPreviewTasks());
      setCategoriesLoading(false);
      setEventsLoading(false);
      setTaskBlocksLoading(false);
      setTasksLoading(false);
      setError("");
      return;
    }

    if (!user) {
      setCategories([]);
      setEvents([]);
      setTaskBlocks([]);
      setTasks([]);
      setCategoriesLoading(false);
      setEventsLoading(false);
      setTaskBlocksLoading(false);
      setTasksLoading(false);
      return;
    }

    setCategoriesLoading(true);
    setEventsLoading(true);
    setTaskBlocksLoading(true);
    setTasksLoading(true);

    const unsubscribeCategories = subscribeToCategories(
      user.uid,
      (nextCategories) => {
        setCategories(nextCategories);
        setCategoriesLoading(false);
        setError("");
      },
      (nextError) => {
        setCategoriesLoading(false);
        setError(toSafeFirebaseMessage(nextError));
      }
    );

    const unsubscribeEvents = subscribeToCalendarEvents(
      user.uid,
      (nextEvents) => {
        setEvents(nextEvents);
        setEventsLoading(false);
        setError("");
      },
      (nextError) => {
        setEventsLoading(false);
        setError(toSafeFirebaseMessage(nextError));
      }
    );

    const unsubscribeTaskBlocks = subscribeToCalendarTaskBlocks(
      user.uid,
      (nextTaskBlocks) => {
        setTaskBlocks(nextTaskBlocks);
        setTaskBlocksLoading(false);
        setError("");
      },
      (nextError) => {
        setTaskBlocksLoading(false);
        setError(toSafeFirebaseMessage(nextError));
      }
    );

    const unsubscribeTasks = subscribeToTasks(
      user.uid,
      (nextTasks) => {
        setTasks(nextTasks);
        setTasksLoading(false);
        setError("");
      },
      (nextError) => {
        setTasksLoading(false);
        setError(toSafeFirebaseMessage(nextError));
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeEvents();
      unsubscribeTaskBlocks();
      unsubscribeTasks();
    };
  }, [user]);

  const value = useMemo(
    () => ({
      categories,
      events,
      taskBlocks,
      tasks,
      isLoading: categoriesLoading || eventsLoading || taskBlocksLoading || tasksLoading,
      error,
      addEvent: async (draft: CalendarEventDraft) => {
        if (!user) return null;
        return createCalendarEvent(user.uid, draft);
      },
      addTask: async (draft: TaskDraft) => {
        if (!user) return null;
        return createTask(user.uid, draft);
      },
      saveEvent: async (eventId: string, draft: CalendarEventDraft) => {
        if (!user) return;
        await updateCalendarEvent(user.uid, eventId, draft);
      },
      deleteEvent: async (eventId: string) => {
        if (!user) return;
        await removeCalendarEvent(user.uid, eventId);
      },
      addTaskBlock: async (draft: CalendarTaskBlockDraft) => {
        if (!user) return;
        await createCalendarTaskBlock(user.uid, draft);
      },
      saveTaskBlock: async (blockId: string, draft: CalendarTaskBlockDraft) => {
        if (!user) return;
        await updateCalendarTaskBlock(user.uid, blockId, draft);
      },
      deleteTaskBlock: async (blockId: string, taskId?: string) => {
        if (!user) return;
        const matchingBlock = taskBlocks.find((taskBlock) => taskBlock.id === blockId);
        await removeCalendarTaskBlock(user.uid, blockId);
        const linkedTaskId = matchingBlock?.taskId || taskId;
        if (linkedTaskId) {
          await removeLinkedCalendarBlock(user.uid, linkedTaskId, blockId);
        }
      },
      addCategory: async (draft: CategoryDraft) => {
        if (!user) return;
        await createCategory(user.uid, draft);
      },
      saveCategory: async (categoryId: string, draft: CategoryDraft) => {
        if (!user) return;
        await updateCategory(user.uid, categoryId, draft);
      },
      deleteCategory: async (categoryId: string) => {
        if (!user) return;
        await removeCategory(user.uid, categoryId);
      },
      scheduleTask: async (
        task: TaskRecord,
        draft: Pick<CalendarTaskBlockDraft, "startAt" | "endAt" | "planningState" | "userAdjusted">
      ) => {
        if (!user) return null;

        const blockId = await createCalendarTaskBlock(user.uid, {
          taskId: task.id,
          titleSnapshot: task.title || "Untitled task",
          categoryId: task.category.trim() || null,
          startAt: draft.startAt,
          endAt: draft.endAt,
          planningState: draft.planningState || "scheduled",
          isFlexible: true,
          userAdjusted: draft.userAdjusted ?? true,
        });

        await addLinkedCalendarBlock(user.uid, task.id, blockId);
        return blockId;
      },
      completeTaskFromCalendar: async (taskId: string) => {
        if (!user) return;
        const matchingTask = tasks.find((task) => task.id === taskId);
        await completeTask(user.uid, taskId);
        if (matchingTask?.linkedCalendarBlockIds.length) {
          await markCalendarTaskBlocksComplete(user.uid, matchingTask.linkedCalendarBlockIds);
        }
      },
      reopenTaskFromCalendar: async (taskId: string) => {
        if (!user) return;
        const matchingTask = tasks.find((task) => task.id === taskId);
        await reopenTask(user.uid, taskId);
        if (matchingTask?.linkedCalendarBlockIds.length) {
          await markCalendarTaskBlocksActive(user.uid, matchingTask.linkedCalendarBlockIds);
        }
      },
    }),
    [
      categories,
      categoriesLoading,
      error,
      events,
      eventsLoading,
      tasks,
      tasksLoading,
      taskBlocks,
      taskBlocksLoading,
      user,
    ]
  );

  return (
    <EasyCalendarContext.Provider value={value}>
      {children}
    </EasyCalendarContext.Provider>
  );
}

export function useEasyCalendar() {
  const context = useContext(EasyCalendarContext);

  if (!context) {
    throw new Error("useEasyCalendar must be used inside EasyCalendarProvider");
  }

  return context;
}
