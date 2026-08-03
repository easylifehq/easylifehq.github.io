import type { WorkoutExerciseRecord } from "../../../lib/firestore/workoutExercises";
import type { WorkoutRoutineRecord } from "../../../lib/firestore/workoutRoutines";
import type { WorkoutSessionRecord } from "../../../lib/firestore/workoutSessions";

export const WORKOUT_DEMO_FIXTURE_VERSION = "weekend-14-week-v1";

type DemoExercise = WorkoutExerciseRecord & {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  exerciseType: "weighted" | "bodyweight" | "duration" | "distance";
};

const exerciseDefinitions = [
  ["bench", "Bench Press", "Chest", ["Chest"], ["Triceps", "Shoulders"], "weighted"],
  ["incline", "Incline Dumbbell Press", "Chest", ["Chest"], ["Triceps", "Shoulders"], "weighted"],
  ["row", "Seated Row", "Back", ["Back"], ["Biceps"], "weighted"],
  ["pulldown", "Lat Pulldown", "Back", ["Back"], ["Biceps"], "weighted"],
  ["squat", "Squat", "Legs", ["Quadriceps", "Glutes"], ["Hamstrings"], "weighted"],
  ["rdl", "Romanian Deadlift", "Hamstrings", ["Hamstrings", "Glutes"], ["Back"], "weighted"],
  ["press", "Shoulder Press", "Shoulders", ["Shoulders"], ["Triceps"], "weighted"],
  ["curl", "Bicep Curl", "Biceps", ["Biceps"], [], "weighted"],
  ["triceps", "Cable Triceps Pressdown", "Triceps", ["Triceps"], [], "weighted"],
  ["pullup", "Pull-up", "Back", ["Back"], ["Biceps"], "bodyweight"],
  ["plank", "Plank", "Core", ["Core"], [], "duration"],
  ["rower", "Row Erg", "Conditioning", ["Conditioning"], [], "distance"],
] as const;

export const workoutDemoExercises: DemoExercise[] = exerciseDefinitions.map(
  ([id, name, muscleGroup, primaryMuscles, secondaryMuscles, exerciseType]) => ({
    id: `demo-${id}`,
    name,
    muscleGroup,
    primaryMuscles: [...primaryMuscles],
    secondaryMuscles: [...secondaryMuscles],
    exerciseType,
    notes: "Synthetic demo exercise",
    createdAt: new Date("2026-04-20T12:00:00Z"),
    updatedAt: new Date("2026-08-01T12:00:00Z"),
  })
);

const routineExercise = (id: string, targetSets = 3, targetReps = "6-10") => {
  const exercise = workoutDemoExercises.find((item) => item.id === `demo-${id}`)!;
  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    targetSets,
    targetReps,
    targetWeight: null,
    restSeconds: 90,
    notes: "",
  };
};

export const workoutDemoRoutines: WorkoutRoutineRecord[] = [
  {
    id: "demo-routine-upper",
    name: "Upper — steady progress",
    notes: "Synthetic demo routine",
    dayLabel: "Upper",
    exercises: [routineExercise("bench", 3, "5"), routineExercise("row"), routineExercise("press"), routineExercise("curl")],
    createdAt: new Date("2026-04-20T12:00:00Z"),
    updatedAt: new Date("2026-08-01T12:00:00Z"),
  },
  {
    id: "demo-routine-lower",
    name: "Lower — hinge and squat",
    notes: "Synthetic demo routine",
    dayLabel: "Lower",
    exercises: [routineExercise("squat"), routineExercise("rdl"), routineExercise("plank", 2, "45 sec")],
    createdAt: new Date("2026-04-20T12:00:00Z"),
    updatedAt: new Date("2026-08-01T12:00:00Z"),
  },
];

function dateOffset(days: number) {
  const date = new Date("2026-08-01T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weightedExercise(id: string, weight: number, reps: number, week: number, options: { plateau?: boolean; drop?: boolean; partial?: boolean } = {}) {
  const definition = workoutDemoExercises.find((item) => item.id === `demo-${id}`)!;
  const workingWeight = options.plateau ? weight : weight + week * 2.5;
  return {
    exerciseId: definition.id,
    exerciseName: definition.name,
    muscleGroup: definition.muscleGroup,
    primaryMuscles: definition.primaryMuscles,
    secondaryMuscles: definition.secondaryMuscles,
    exerciseType: definition.exerciseType,
    notes: week === 8 ? "Planned deload" : "",
    sets: [
      { reps: 8, weight: Math.max(20, workingWeight * 0.55), notes: "Warm-up", setType: "warmup" as const, completed: true, deleted: false, rir: null },
      { reps, weight: workingWeight, notes: "", setType: "standard" as const, completed: true, deleted: false, rir: week % 3 === 0 ? 2 : null },
      { reps, weight: workingWeight, notes: "", setType: "standard" as const, completed: true, deleted: false, rir: week % 4 === 0 ? 1 : null },
      { reps: Math.max(4, reps - 1), weight: workingWeight, notes: "", setType: "standard" as const, completed: !options.partial, deleted: false, rir: null },
      ...(options.drop ? [{ reps: 12, weight: workingWeight * 0.7, notes: "Controlled drop", setType: "drop" as const, completed: true, deleted: false, rir: 1 }] : []),
    ],
  };
}

function demoSession(week: number, dayInWeek: number, lane: "upper" | "lower" | "pull"): WorkoutSessionRecord {
  const deload = week === 8 ? 0.9 : 1;
  const performedOn = dateOffset(-(13 - week) * 7 + dayInWeek - 6);
  const exercises: WorkoutSessionRecord["exercises"] = lane === "upper"
    ? [
        weightedExercise("bench", Math.round((week >= 8 ? 185 : 145 + week * 5) * deload), 5, 0, { plateau: true, drop: week === 5 }),
        weightedExercise("row", Math.round(105 * deload), 8, week),
        weightedExercise("press", Math.round(65 * deload), 8, week),
        weightedExercise("triceps", Math.round(35 * deload), 10, week),
      ]
    : lane === "lower"
      ? [
          weightedExercise("squat", Math.round(155 * deload), 6, week, { partial: week === 4 }),
          weightedExercise("rdl", Math.round(135 * deload), 8, week),
          {
            exerciseId: "demo-plank", exerciseName: "Plank", muscleGroup: "Core", primaryMuscles: ["Core"], secondaryMuscles: [], exerciseType: "duration" as const, notes: "",
            sets: [{ reps: 0, weight: 0, durationSeconds: 45 + week, notes: "", setType: "standard" as const, completed: true, deleted: false, rir: null }],
          },
        ]
      : [
          weightedExercise("pulldown", Math.round(95 * deload), 9, week),
          weightedExercise("incline", Math.round(45 * deload), 10, week),
          weightedExercise("curl", Math.round(25 * deload), 10, week),
          {
            exerciseId: "demo-pullup", exerciseName: "Pull-up", muscleGroup: "Back", primaryMuscles: ["Back"], secondaryMuscles: ["Biceps"], exerciseType: "bodyweight" as const, notes: "",
            sets: [{ reps: 6 + Math.floor(week / 4), weight: 0, notes: "", setType: "standard" as const, completed: true, deleted: false, rir: week % 2 ? null : 2 }],
          },
        ];
  if (week === 2 && lane === "pull") exercises[0].sets.push({ reps: 30, weight: 40, notes: "High-rep confidence fixture", setType: "standard", completed: true, deleted: true, rir: null });
  return {
    id: `demo-session-w${week}-${lane}`,
    clientDraftId: `demo-draft-w${week}-${lane}`,
    schemaVersion: 2,
    routineId: lane === "lower" ? "demo-routine-lower" : lane === "upper" ? "demo-routine-upper" : null,
    routineName: lane === "lower" ? "Lower — hinge and squat" : lane === "upper" ? "Upper — steady progress" : "Pull and accessories",
    performedOn,
    durationMinutes: 48 + ((week + dayInWeek) % 4) * 6,
    notes: week === 8 ? "Deload week" : week === 10 ? "Return after missed week" : "Synthetic demo workout",
    exercises,
    createdAt: new Date(`${performedOn}T18:00:00Z`),
    updatedAt: new Date(`${performedOn}T19:00:00Z`),
  };
}

export const workoutDemoSessions: WorkoutSessionRecord[] = Array.from({ length: 14 }, (_, week) => week)
  .filter((week) => week !== 9)
  .flatMap((week) => [demoSession(week, 0, "upper"), demoSession(week, 2, "lower"), demoSession(week, 4, "pull")])
  .concat([
    {
      ...demoSession(0, 0, "upper"),
      id: "demo-dst-boundary",
      clientDraftId: "demo-draft-dst-boundary",
      performedOn: "2026-03-08",
      routineName: "DST boundary fixture",
      notes: "Synthetic local-date boundary fixture",
      createdAt: new Date("2026-03-08T08:30:00-06:00"),
      updatedAt: new Date("2026-03-08T09:30:00-06:00"),
    },
  ])
  .sort((left, right) => right.performedOn.localeCompare(left.performedOn));

export const workoutDemoMetadata = {
  fixtureVersion: WORKOUT_DEMO_FIXTURE_VERSION,
  rangeLabel: "14 weeks plus one DST boundary case",
  storage: "Read-only synthetic seed; demo saves stay in memory and never call Firebase.",
};
