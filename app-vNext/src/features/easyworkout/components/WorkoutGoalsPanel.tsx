import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { deriveWorkoutGoalProgress, type WorkoutGoal, type WorkoutGoalDraft, type WorkoutGoalStatus } from "../domain/workoutGoals";
import type { AnalyticsSession, WorkoutDisplayUnit } from "../domain/workoutStatistics";

type ExerciseOption = { id: string; name: string; exerciseType?: string };

export function WorkoutGoalsPanel({ goals, sessions, exercises, displayUnit, isDemoMode, onCreate, onEdit, onStatus }: {
  goals: WorkoutGoal[]; sessions: AnalyticsSession[]; exercises: ExerciseOption[]; displayUnit: WorkoutDisplayUnit; isDemoMode: boolean;
  onCreate: (draft: WorkoutGoalDraft) => Promise<void>; onEdit: (goal: WorkoutGoal, draft: WorkoutGoalDraft) => Promise<void>; onStatus: (goal: WorkoutGoal, status: WorkoutGoalStatus) => Promise<void>;
}) {
  const [type, setType] = useState<"weekly-workouts" | "exercise-e1rm">("weekly-workouts");
  const [target, setTarget] = useState("3");
  const [exerciseId, setExerciseId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const today = new Date();
  const nowDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const progress = useMemo(() => deriveWorkoutGoalProgress(goals, sessions, { nowDateKey }), [goals, sessions, nowDateKey]);
  const weightedExercises = exercises.filter((exercise) => !exercise.exerciseType || exercise.exerciseType === "weighted");
  const selectedExercise = weightedExercises.find((exercise) => exercise.id === exerciseId);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    const numericTarget = Number(target);
    if (!Number.isFinite(numericTarget) || numericTarget <= 0 || (type === "weekly-workouts" && !Number.isInteger(numericTarget))) { setMessage("Enter a valid positive target."); return; }
    if (type === "exercise-e1rm" && !selectedExercise) { setMessage("Choose a weighted exercise."); return; }
    const draft: WorkoutGoalDraft = { goalType: type, target: numericTarget, sourceUnit: type === "weekly-workouts" ? "count" : displayUnit, exerciseId: type === "weekly-workouts" ? null : selectedExercise!.id, exerciseName: type === "weekly-workouts" ? "" : selectedExercise!.name };
    const editing = goals.find((goal) => goal.id === editingId);
    await (editing ? onEdit(editing, draft) : onCreate(draft));
    setMessage(isDemoMode ? "Demo preview updated in memory. No Firebase write ran." : editing ? "Goal updated." : "Goal created.");
    setEditingId("");
  }

  function edit(goal: WorkoutGoal) { setEditingId(goal.id); setType(goal.goalType); setTarget(String(goal.target)); setExerciseId(goal.exerciseId || ""); }

  return <PageSection eyebrow="Personal goals" title="Small targets, derived from your log" description="Goals never change routines. Progress is calculated from completed workout evidence; pausing or archiving is reversible.">
    <form className="workout-goal-form" onSubmit={submit}>
      <label className="field-stack"><span>Goal type</span><select value={type} disabled={Boolean(editingId)} onChange={(event) => { setType(event.target.value as typeof type); setTarget(event.target.value === "weekly-workouts" ? "3" : "200"); }}><option value="weekly-workouts">Weekly completed workouts</option><option value="exercise-e1rm">Exercise estimated 1RM</option></select></label>
      {type === "exercise-e1rm" ? <label className="field-stack"><span>Weighted exercise</span><select value={exerciseId} disabled={Boolean(editingId)} required onChange={(event) => setExerciseId(event.target.value)}><option value="">Choose exercise</option>{weightedExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></label> : null}
      <label className="field-stack"><span>Target {type === "exercise-e1rm" ? displayUnit : "workouts"}</span><input type="number" min="1" step={type === "weekly-workouts" ? "1" : "0.5"} value={target} onChange={(event) => setTarget(event.target.value)} /></label>
      <div className="button-row"><button className="primary-button compact-button" type="submit">{editingId ? "Save changes" : "Create goal"}</button>{editingId ? <button type="button" className="button-secondary compact-button" onClick={() => setEditingId("")}>Cancel</button> : null}</div>
    </form>
    {message ? <p role="status" className="helper-copy">{message}</p> : null}
    <div className="workout-goal-list">
      {progress.length ? progress.map((item) => <article key={item.goal.id} className={`statistics-insight-card workout-goal-card ${item.goal.status}`}>
        <span>{item.goal.status} · {item.goal.schemaVersion}</span><strong>{item.goal.goalType === "weekly-workouts" ? "Weekly workouts" : item.goal.exerciseName}</strong>
        <p>{item.current.toFixed(item.unit === "workouts" ? 0 : 1)} / {item.target.toFixed(item.unit === "workouts" ? 0 : 1)} {item.unit} · {item.achieved ? "target reached" : "in progress"}</p>
        <small>{item.sampleSize} source sample{item.sampleSize === 1 ? "" : "s"} · {item.periodLabel} · {item.goal.formulaVersion} · {item.confidence} confidence</small>
        {item.sourceWorkoutId ? <Link to={`/app/easyworkout/session/${encodeURIComponent(item.sourceWorkoutId)}${isDemoMode ? "?demo=1" : ""}`}>Open source workout</Link> : null}
        <div className="button-row"><button className="button-secondary compact-button" type="button" onClick={() => edit(item.goal)}>Edit</button>{item.goal.status === "active" ? <button className="button-secondary compact-button" type="button" onClick={() => onStatus(item.goal, "paused")}>Pause</button> : item.goal.status === "paused" ? <button className="button-secondary compact-button" type="button" onClick={() => onStatus(item.goal, "active")}>Resume</button> : <button className="button-secondary compact-button" type="button" onClick={() => onStatus(item.goal, "active")}>Restore</button>}{item.goal.status !== "archived" ? <button className="button-secondary compact-button" type="button" onClick={() => onStatus(item.goal, "archived")}>Archive</button> : null}</div>
      </article>) : <div className="empty-card-vnext"><strong>No workout goal yet</strong><p>Create one small target. Achievement will be derived only from saved workout data.</p></div>}
    </div>
  </PageSection>;
}
