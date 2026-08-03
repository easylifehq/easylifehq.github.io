import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "../../../components/ui/PageSection";
import type { WorkoutRoutineRecord } from "../../../lib/firestore/workoutRoutines";
import type { WorkoutSessionRecord } from "../../../lib/firestore/workoutSessions";
import { createWorkoutExportPayload, filterWorkoutHistory, getWorkoutPrSessionIds, serializeWorkoutCsv } from "../domain/workoutHistoryTools";
import type { WorkoutDisplayUnit } from "../domain/workoutStatistics";

const localDateKey = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function WorkoutHistoryTools({ routines, sessions, displayUnit, isDemoMode, isLoading }: { routines: WorkoutRoutineRecord[]; sessions: WorkoutSessionRecord[]; displayUnit: WorkoutDisplayUnit; isDemoMode: boolean; isLoading: boolean }) {
  const [routineId, setRoutineId] = useState("all");
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [periodDays, setPeriodDays] = useState<number | null>(90);
  const [prOnly, setPrOnly] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const filtered = useMemo(() => filterWorkoutHistory(sessions, { routineId, exerciseQuery, periodDays, prOnly }, displayUnit, localDateKey()), [displayUnit, exerciseQuery, periodDays, prOnly, routineId, sessions]);
  const prSessionIds = useMemo(() => getWorkoutPrSessionIds(sessions, displayUnit), [displayUnit, sessions]);
  const visible = filtered.slice(0, 25);
  const demoSearch = isDemoMode ? "?demo=1" : "";

  const runExport = (format: "json" | "csv") => {
    const payload = createWorkoutExportPayload({ routines, sessions: filtered, exportedAt: new Date().toISOString(), displayUnit });
    const filename = `easyworkout-${localDateKey()}-${filtered.length}-sessions.${format}`;
    if (format === "json") downloadText(filename, JSON.stringify(payload, null, 2), "application/json");
    else downloadText(filename, serializeWorkoutCsv(payload), "text/csv;charset=utf-8");
    setExportStatus(`${filtered.length} shown session${filtered.length === 1 ? "" : "s"} exported as ${format.toUpperCase()}. Nothing was uploaded or changed.`);
  };

  return (
    <PageSection eyebrow="History tools" title="Find and take your workout data" description="Search saved sessions, narrow to record evidence, or download the shown result. Filters and exports never modify Firestore.">
      <div className="workout-history-filters">
        <label className="field-stack"><span>Routine</span><select value={routineId} onChange={(event) => setRoutineId(event.target.value)}><option value="all">All routines</option>{routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}</select></label>
        <label className="field-stack"><span>Routine or exercise</span><input type="search" value={exerciseQuery} onChange={(event) => setExerciseQuery(event.target.value)} placeholder="Bench Press" /></label>
        <label className="field-stack"><span>Date window</span><select value={periodDays || "all"} onChange={(event) => setPeriodDays(event.target.value === "all" ? null : Number(event.target.value))}><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option><option value="all">All history</option></select></label>
        <label className="field-stack workout-history-check"><span>Evidence</span><span><input type="checkbox" checked={prOnly} onChange={(event) => setPrOnly(event.target.checked)} /> PR source workouts only</span></label>
      </div>
      <div className="task-composer-actions workout-export-actions">
        <button type="button" className="button-secondary compact-button" disabled={!filtered.length} onClick={() => runExport("json")}>Export shown JSON</button>
        <button type="button" className="button-secondary compact-button" disabled={!filtered.length} onClick={() => runExport("csv")}>Export shown CSV</button>
        <button type="button" className="ghost-button compact-button" onClick={() => { setRoutineId("all"); setExerciseQuery(""); setPeriodDays(90); setPrOnly(false); }}>Clear filters</button>
      </div>
      {exportStatus ? <p className="workout-save-status status-saved-local" role="status">{exportStatus}</p> : null}
      {isLoading ? <p role="status">Loading workout history…</p> : null}
      {!isLoading ? <p className="helper-copy">{filtered.length} matching session{filtered.length === 1 ? "" : "s"}{filtered.length > visible.length ? ` · showing the newest ${visible.length}` : ""}.</p> : null}
      {!isLoading && !visible.length ? <div className="empty-card-vnext"><strong>No workouts match these filters</strong><p>Clear a filter or start a new routine. No history was removed.</p></div> : null}
      <div className="task-list-vnext workout-history-results">
        {visible.map((session) => (
          <article className="task-card-vnext" key={session.id}>
            <div className="task-card-copy"><div className="task-card-title-row"><h3>{session.routineName || "Workout"}</h3><span className="priority-pill-vnext">{session.performedOn}</span></div><p>{(session.exercises || []).map((exercise) => exercise.exerciseName).filter(Boolean).join(" · ") || "No exercise names"}</p><p>{session.exercises?.length || 0} exercises · {session.durationMinutes || 0} minutes · stored in {session.weightUnit || "lb"}{prSessionIds.has(session.id) ? " · PR evidence" : ""}</p></div>
            <div className="task-card-actions"><Link className="button-secondary compact-button" to={`/app/easyworkout/session/${encodeURIComponent(session.id)}${demoSearch}`}>Review</Link></div>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
