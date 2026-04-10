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
  reopenTask,
  subscribeToTasks,
  updateTask,
  type TaskDraft,
  type TaskRecord,
} from "@/lib/firestore/tasks";
import { useAuth } from "@/features/auth/AuthContext";

type EasyListContextValue = {
  tasks: TaskRecord[];
  isLoading: boolean;
  error: string;
  addTask: (draft: TaskDraft) => Promise<void>;
  saveTask: (taskId: string, draft: TaskDraft) => Promise<void>;
  markComplete: (taskId: string) => Promise<void>;
  markActive: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
};

const EasyListContext = createContext<EasyListContextValue | undefined>(undefined);

export function EasyListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
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
        setError(nextError.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function addTaskFromDraft(draft: TaskDraft) {
    if (!user) return;
    await createTask(user.uid, draft);
  }

  async function saveTaskFromDraft(taskId: string, draft: TaskDraft) {
    if (!user) return;
    await updateTask(user.uid, taskId, draft);
  }

  async function markCompleteForUser(taskId: string) {
    if (!user) return;
    await completeTask(user.uid, taskId);
  }

  async function markActiveForUser(taskId: string) {
    if (!user) return;
    await reopenTask(user.uid, taskId);
  }

  async function deleteTaskForUser(taskId: string) {
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
