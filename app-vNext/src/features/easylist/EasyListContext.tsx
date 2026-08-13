import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  completeTask,
  createTask,
  removeTask,
  restoreTask,
  reopenTask,
  softDeleteTask,
  subscribeToTasks,
  updateTask,
  type TaskDraft,
  type TaskRecord,
} from "@/lib/firestore/tasks";
import {
  markCalendarTaskBlocksActive,
  markCalendarTaskBlocksComplete,
} from "@/lib/firestore/calendarTaskBlocks";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import {
  createSyntheticTask,
  removeSyntheticTask,
  setSyntheticTaskComplete,
  setSyntheticTaskDeleted,
  updateSyntheticTask,
  useSyntheticAuditState,
} from "@/lib/runtime/syntheticAuditState";

type EasyListContextValue = {
  tasks: TaskRecord[];
  isLoading: boolean;
  error: string;
  addTask: (draft: TaskDraft) => Promise<string | null>;
  saveTask: (taskId: string, draft: TaskDraft) => Promise<void>;
  markComplete: (taskId: string) => Promise<void>;
  markActive: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  restoreDeletedTask: (taskId: string) => Promise<void>;
  removeTaskPermanently: (taskId: string) => Promise<void>;
};

const EasyListContext = createContext<EasyListContextValue | undefined>(undefined);

export function EasyListProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const syntheticState = useSyntheticAuditState(isDemoMode);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || isDemoMode) {
      setTasks(isDemoMode ? syntheticState.tasks : []);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToTasks(
      user.uid,
      (nextTasks) => {
        setTasks(nextTasks);
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [isDemoMode, syntheticState.tasks, user]);

  async function addTaskFromDraft(draft: TaskDraft) {
    if (isDemoMode) return createSyntheticTask(draft);
    if (!user) return null;
    return createTask(user.uid, draft);
  }

  async function saveTaskFromDraft(taskId: string, draft: TaskDraft) {
    if (isDemoMode) return updateSyntheticTask(taskId, draft);
    if (!user) return;
    await updateTask(user.uid, taskId, draft);
  }

  async function markCompleteForUser(taskId: string) {
    if (isDemoMode) return setSyntheticTaskComplete(taskId, true);
    if (!user) return;
    const task = tasks.find((entry) => entry.id === taskId);
    await completeTask(user.uid, taskId);
    if (task?.linkedCalendarBlockIds.length) {
      await markCalendarTaskBlocksComplete(user.uid, task.linkedCalendarBlockIds);
    }
  }

  async function markActiveForUser(taskId: string) {
    if (isDemoMode) return setSyntheticTaskComplete(taskId, false);
    if (!user) return;
    const task = tasks.find((entry) => entry.id === taskId);
    await reopenTask(user.uid, taskId);
    if (task?.linkedCalendarBlockIds.length) {
      await markCalendarTaskBlocksActive(user.uid, task.linkedCalendarBlockIds);
    }
  }

  async function deleteTaskForUser(taskId: string) {
    if (isDemoMode) return setSyntheticTaskDeleted(taskId, true);
    if (!user) return;
    await softDeleteTask(user.uid, taskId);
  }

  async function restoreDeletedTaskForUser(taskId: string) {
    if (isDemoMode) return setSyntheticTaskDeleted(taskId, false);
    if (!user) return;
    await restoreTask(user.uid, taskId);
  }

  async function removeTaskPermanentlyForUser(taskId: string) {
    if (isDemoMode) return removeSyntheticTask(taskId);
    if (!user) return;
    await removeTask(user.uid, taskId);
  }

  return (
    <EasyListContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        addTask: addTaskFromDraft,
        saveTask: saveTaskFromDraft,
        markComplete: markCompleteForUser,
        markActive: markActiveForUser,
        deleteTask: deleteTaskForUser,
        restoreDeletedTask: restoreDeletedTaskForUser,
        removeTaskPermanently: removeTaskPermanentlyForUser,
      }}
    >
      {children}
    </EasyListContext.Provider>
  );
}

export function useEasyList() {
  const context = useContext(EasyListContext);

  if (!context) {
    throw new Error("useEasyList must be used inside EasyListProvider");
  }

  return context;
}
