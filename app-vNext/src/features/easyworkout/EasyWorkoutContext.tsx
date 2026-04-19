import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  createWorkoutExercise,
  removeWorkoutExercise,
  subscribeToWorkoutExercises,
  updateWorkoutExercise,
  type WorkoutExerciseDraft,
  type WorkoutExerciseRecord,
} from "@/lib/firestore/workoutExercises";
import {
  createWorkoutRoutine,
  removeWorkoutRoutine,
  subscribeToWorkoutRoutines,
  updateWorkoutRoutine,
  type WorkoutRoutineDraft,
  type WorkoutRoutineRecord,
} from "@/lib/firestore/workoutRoutines";
import {
  createWorkoutSession,
  removeWorkoutSession,
  subscribeToWorkoutSessions,
  updateWorkoutSession,
  type WorkoutSessionDraft,
  type WorkoutSessionRecord,
} from "@/lib/firestore/workoutSessions";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";

type EasyWorkoutContextValue = {
  exercises: WorkoutExerciseRecord[];
  routines: WorkoutRoutineRecord[];
  sessions: WorkoutSessionRecord[];
  isLoading: boolean;
  error: string;
  addExercise: (draft: WorkoutExerciseDraft) => Promise<string | null>;
  saveExercise: (exerciseId: string, draft: WorkoutExerciseDraft) => Promise<void>;
  deleteExercise: (exerciseId: string) => Promise<void>;
  addRoutine: (draft: WorkoutRoutineDraft) => Promise<string | null>;
  saveRoutine: (routineId: string, draft: WorkoutRoutineDraft) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  addSession: (draft: WorkoutSessionDraft) => Promise<string | null>;
  saveSession: (sessionId: string, draft: WorkoutSessionDraft) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
};

const EasyWorkoutContext = createContext<EasyWorkoutContextValue | undefined>(undefined);

export const defaultWorkoutExercises: Array<Pick<WorkoutExerciseDraft, "name" | "muscleGroup">> = [
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Seated Row", muscleGroup: "Back" },
  { name: "Bicep Curl", muscleGroup: "Biceps" },
  { name: "Hammer Curl", muscleGroup: "Biceps" },
  { name: "Shoulder Press", muscleGroup: "Shoulders" },
  { name: "Lateral Raise", muscleGroup: "Shoulders" },
  { name: "Squat", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Hip Thrust", muscleGroup: "Glutes" },
];

export function EasyWorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WorkoutExerciseRecord[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutineRecord[]>([]);
  const [sessions, setSessions] = useState<WorkoutSessionRecord[]>([]);
  const [error, setError] = useState("");
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExercises([]);
      setRoutines([]);
      setSessions([]);
      setExercisesLoading(false);
      setRoutinesLoading(false);
      setSessionsLoading(false);
      return;
    }

    setExercisesLoading(true);
    setRoutinesLoading(true);
    setSessionsLoading(true);

    const unsubscribeExercises = subscribeToWorkoutExercises(
      user.uid,
      (records) => {
        setExercises(records);
        setExercisesLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setExercisesLoading(false);
      }
    );

    const unsubscribeRoutines = subscribeToWorkoutRoutines(
      user.uid,
      (records) => {
        setRoutines(records);
        setRoutinesLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setRoutinesLoading(false);
      }
    );

    const unsubscribeSessions = subscribeToWorkoutSessions(
      user.uid,
      (records) => {
        setSessions(records);
        setSessionsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setSessionsLoading(false);
      }
    );

    return () => {
      unsubscribeExercises();
      unsubscribeRoutines();
      unsubscribeSessions();
    };
  }, [user]);

  const value = useMemo(
    () => ({
      exercises,
      routines,
      sessions,
      isLoading: exercisesLoading || routinesLoading || sessionsLoading,
      error,
      addExercise: async (draft: WorkoutExerciseDraft) => {
        if (!user) return null;
        return createWorkoutExercise(user.uid, draft);
      },
      saveExercise: async (exerciseId: string, draft: WorkoutExerciseDraft) => {
        if (!user) return;
        await updateWorkoutExercise(user.uid, exerciseId, draft);
      },
      deleteExercise: async (exerciseId: string) => {
        if (!user) return;
        await removeWorkoutExercise(user.uid, exerciseId);
      },
      addRoutine: async (draft: WorkoutRoutineDraft) => {
        if (!user) return null;
        return createWorkoutRoutine(user.uid, draft);
      },
      saveRoutine: async (routineId: string, draft: WorkoutRoutineDraft) => {
        if (!user) return;
        await updateWorkoutRoutine(user.uid, routineId, draft);
      },
      deleteRoutine: async (routineId: string) => {
        if (!user) return;
        await removeWorkoutRoutine(user.uid, routineId);
      },
      addSession: async (draft: WorkoutSessionDraft) => {
        if (!user) return null;
        return createWorkoutSession(user.uid, draft);
      },
      saveSession: async (sessionId: string, draft: WorkoutSessionDraft) => {
        if (!user) return;
        await updateWorkoutSession(user.uid, sessionId, draft);
      },
      deleteSession: async (sessionId: string) => {
        if (!user) return;
        await removeWorkoutSession(user.uid, sessionId);
      },
    }),
    [
      error,
      exercises,
      exercisesLoading,
      routines,
      routinesLoading,
      sessions,
      sessionsLoading,
      user,
    ]
  );

  return <EasyWorkoutContext.Provider value={value}>{children}</EasyWorkoutContext.Provider>;
}

export function useEasyWorkout() {
  const context = useContext(EasyWorkoutContext);
  if (!context) {
    throw new Error("useEasyWorkout must be used inside EasyWorkoutProvider");
  }

  return context;
}
