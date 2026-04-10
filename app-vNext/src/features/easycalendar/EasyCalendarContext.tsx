import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
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
  removeLinkedCalendarBlock,
  reopenTask,
  subscribeToTasks,
  type TaskRecord,
} from "@/lib/firestore/tasks";

type EasyCalendarContextValue = {
  categories: CategoryRecord[];
  events: CalendarEventRecord[];
  taskBlocks: CalendarTaskBlockRecord[];
  tasks: TaskRecord[];
  isLoading: boolean;
  error: string;
  addEvent: (draft: CalendarEventDraft) => Promise<void>;
  saveEvent: (eventId: string, draft: CalendarEventDraft) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addTaskBlock: (draft: CalendarTaskBlockDraft) => Promise<void>;
  saveTaskBlock: (blockId: string, draft: CalendarTaskBlockDraft) => Promise<void>;
  deleteTaskBlock: (blockId: string) => Promise<void>;
  addCategory: (draft: CategoryDraft) => Promise<void>;
  saveCategory: (categoryId: string, draft: CategoryDraft) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  scheduleTask: (
    task: TaskRecord,
    draft: Pick<CalendarTaskBlockDraft, "startAt" | "endAt" | "planningState" | "userAdjusted">
  ) => Promise<void>;
  completeTaskFromCalendar: (taskId: string) => Promise<void>;
  reopenTaskFromCalendar: (taskId: string) => Promise<void>;
};

const EasyCalendarContext = createContext<EasyCalendarContextValue | undefined>(
  undefined
);

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
        setError(nextError.message);
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
        setError(nextError.message);
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
        setError(nextError.message);
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
        setError(nextError.message);
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
        if (!user) return;
        await createCalendarEvent(user.uid, draft);
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
      deleteTaskBlock: async (blockId: string) => {
        if (!user) return;
        const matchingBlock = taskBlocks.find((taskBlock) => taskBlock.id === blockId);
        await removeCalendarTaskBlock(user.uid, blockId);
        if (matchingBlock?.taskId) {
          await removeLinkedCalendarBlock(user.uid, matchingBlock.taskId, blockId);
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
        if (!user) return;

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
