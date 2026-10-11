import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";
import type { WorkoutExerciseLogDraft } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import { workoutExerciseIdentityKey, type ExerciseHistorySummary } from "@/features/easyworkout/domain/workoutLogAssist";
import type { PlanningExerciseOption, WorkoutNextExerciseSuggestion } from "@/features/easyworkout/domain/workoutNextExercise";
import { replaceRemainingWorkoutProposal } from "@/features/easyworkout/domain/workoutRemainingPlan";
import { deriveSessionWorkoutPlan, prepareSessionWorkoutInput, type SessionWorkoutPlan } from "@/features/easyworkout/domain/workoutSessionPlan";
import { WORKOUT_EQUIPMENT_KINDS, parseWorkoutPlanningDurationInput, type WorkoutPlanningContext } from "@/features/easyworkout/domain/workoutPlanning";
import { useWorkoutPlannerGoals } from "./useWorkoutPlannerGoals";
type Props = {
  planningContext: WorkoutPlanningContext; setPlanningContext: Dispatch<SetStateAction<WorkoutPlanningContext>>;
  planningDurationInput: string; setPlanningDurationInput: (value:string)=>void;
  exerciseOptions: PlanningExerciseOption[]; exerciseLogs: WorkoutExerciseLogDraft[];
  sessions: WorkoutSessionRecord[]; performedOn: string; currentDraftId: string; historyLoading: boolean;
  history: Record<string,ExerciseHistorySummary>; defaultSetCount:number;
  onAddSuggestion:(suggestion:WorkoutNextExerciseSuggestion)=>void;
  onAddPlan:(suggestions:WorkoutNextExerciseSuggestion[])=>void;
};
export function QuickWorkoutNextExercise(props:Props) {
  const {planningContext,setPlanningContext,planningDurationInput,setPlanningDurationInput,exerciseOptions,exerciseLogs,sessions,performedOn,currentDraftId,historyLoading,history,defaultSetCount,onAddSuggestion,onAddPlan}=props;
  const hasCurrentWork=exerciseLogs.some(e=>e.exerciseName.trim());
  const [scope,setScope]=useState<"whole"|"continue">(hasCurrentWork?"continue":"whole");
  const [budgetKind,setBudgetKind]=useState<"time"|"sets">(planningContext.remainingBudget?.kind||"time");
  const [setInput,setSetInput]=useState(planningContext.remainingBudget?.kind==="sets"?String(planningContext.remainingBudget.amount):"");
  const [plan,setPlan]=useState<SessionWorkoutPlan|null>(null);
  const [acceptedKeys,setAcceptedKeys]=useState<string[]>([]);
  const [feedback,setFeedback]=useState("");
  const acceptedRef=useRef(new Set<string>()), replacedRef=useRef(new Set<string>());
  const {goals,loading:goalsLoading,warning:goalsWarning}=useWorkoutPlannerGoals();
  useEffect(()=>{if(hasCurrentWork)setScope("continue");},[hasCurrentWork]);
  const contextKey=JSON.stringify([planningContext,scope]);
  useEffect(()=>{setPlan(null);setFeedback("");setAcceptedKeys([]);acceptedRef.current.clear();replacedRef.current.clear();},[contextKey]);
  const budget=planningContext.remainingBudget||(budgetKind==="time"&&parseWorkoutPlanningDurationInput(planningDurationInput)?{kind:"time" as const,amount:Number(planningDurationInput)}:undefined);
  const input=useMemo(()=>({planningContext,budget,exerciseOptions,exerciseLogs,history,defaultSetCount,sessions,goals,scope,nowDateKey:performedOn,currentDraftId}),[planningContext,budget,exerciseOptions,exerciseLogs,history,defaultSetCount,sessions,goals,scope,performedOn,currentDraftId]);
  const limited=planningContext.equipmentMode==="limited";
  const key=workoutExerciseIdentityKey;
  const exists=(s:WorkoutNextExerciseSuggestion)=>exerciseLogs.some(e=>key({exerciseId:e.exerciseId,name:e.exerciseName})===key(s));
  function generate(){setPlan(deriveSessionWorkoutPlan(input));setAcceptedKeys([]);acceptedRef.current.clear();replacedRef.current.clear();setFeedback("");}
  function accept(s:WorkoutNextExerciseSuggestion){if(acceptedRef.current.has(key(s))||exists(s))return;acceptedRef.current.add(key(s));setAcceptedKeys(current=>[...current,key(s)]);onAddSuggestion(s);setFeedback("Added to this workout as planned rows. Nothing is marked performed.");}
  function acceptAll(){if(!plan)return;const additions=plan.proposals.filter(s=>!acceptedRef.current.has(key(s))&&!exists(s));if(!additions.length)return;additions.forEach(s=>acceptedRef.current.add(key(s)));setAcceptedKeys([...acceptedRef.current]);onAddPlan(additions);setFeedback("Workout added to this session as unperformed rows. Enter only the work you actually do.");}
  function replace(s:WorkoutNextExerciseSuggestion){if(!plan)return;const prepared=prepareSessionWorkoutInput(input);const replacement=replaceRemainingWorkoutProposal(plan,key(s),{...prepared.input,excludedKeys:[...(prepared.input.excludedKeys||[]),...replacedRef.current]});if(replacement===plan){setFeedback("No other exercise fits this slot and your recorded choices.");return;}replacedRef.current.add(key(s));setPlan({...plan,...replacement});}
  return <details className="workout-planner workout-next-lift-card">
    <summary className="ghost-button compact-button workout-next-lift-summary"><strong>Plan workout</strong></summary>
    <div className="workout-planning-controls">
      <label className="field-stack"><span>Plan</span><select aria-label="Workout planning scope" value={scope} onChange={event=>setScope(event.target.value as typeof scope)}><option value="whole" disabled={hasCurrentWork}>Complete workout</option><option value="continue">Continue this workout</option></select></label>
      {budgetKind==="time"?<label className="field-stack"><span>{scope==="whole"?"Time available":"Time left"} (minutes)</span><input aria-label="Remaining minutes" type="text" inputMode="numeric" value={planningDurationInput} placeholder="45" onChange={event=>{setPlanningDurationInput(event.target.value);const minutes=parseWorkoutPlanningDurationInput(event.target.value);setPlanningContext(current=>({...current,plannedDurationMinutes:null,remainingBudget:minutes===null?undefined:{kind:"time",amount:minutes}}));}} /></label>:<label className="field-stack"><span>Advanced set target</span><input aria-label="Remaining sets" type="text" inputMode="numeric" value={setInput} onChange={event=>{setSetInput(event.target.value);const n=/^\d+$/.test(event.target.value)?Number(event.target.value):0;setPlanningContext(current=>({...current,remainingBudget:n>=1&&n<=80?{kind:"sets",amount:n}:undefined}));}} /></label>}
    </div>
    <details className="workout-planning-advanced"><summary>Advanced choices</summary>
      <label className="field-stack"><span>Plan by</span><select aria-label="Remaining budget type" value={budgetKind} onChange={event=>{setBudgetKind(event.target.value as typeof budgetKind);setPlanningContext(current=>({...current,remainingBudget:undefined,plannedDurationMinutes:null}));}}><option value="time">Time</option><option value="sets">Optional set target</option></select></label>
      <label className="workout-planning-choice"><input type="checkbox" aria-label="Limited equipment" checked={limited} onChange={event=>setPlanningContext(current=>({...current,equipmentMode:event.target.checked?"limited":"full-gym",availableEquipment:event.target.checked?current.availableEquipment:[...WORKOUT_EQUIPMENT_KINDS]}))} />Limited equipment</label>
      {limited?<div className="workout-planning-choices">{WORKOUT_EQUIPMENT_KINDS.map(equipment=><label key={equipment} className="workout-planning-choice"><input type="checkbox" aria-label={`Available ${equipment.replace(/-/g," ")}`} checked={planningContext.availableEquipment.includes(equipment)} onChange={event=>setPlanningContext(current=>({...current,availableEquipment:event.target.checked?[...current.availableEquipment,equipment]:current.availableEquipment.filter(e=>e!==equipment)}))} />{equipment.replace(/-/g," ")}</label>)}</div>:<small>Full gym</small>}
      <label className="field-stack"><span>Recorded rest choice (days)</span><input aria-label="Recorded rest days" type="number" min="0" max="7" value={planningContext.recoveryDays||0} onChange={event=>{const n=Number(event.target.value);if(Number.isInteger(n)&&n>=0&&n<=7)setPlanningContext(current=>({...current,recoveryDays:n}));}} /></label>
      <details><summary>Exercises to avoid for this plan</summary><div className="workout-planning-choices">{exerciseOptions.filter(e=>e.planningMetadata).map(option=><label key={key(option)} className="workout-planning-choice"><input type="checkbox" aria-label={`Avoid ${option.name}`} checked={planningContext.avoidedExerciseKeys?.includes(key(option))||false} onChange={event=>setPlanningContext(current=>({...current,avoidedExerciseKeys:event.target.checked?[...(current.avoidedExerciseKeys||[]),key(option)]:(current.avoidedExerciseKeys||[]).filter(k=>k!==key(option))}))} />{option.name}</label>)}</div></details>
      <small>Only recorded choices restrict exercises. No hand or recovery diagnosis is inferred from notes.</small>
    </details>
    <button type="button" className="button-secondary" disabled={historyLoading||goalsLoading} onClick={generate}>Generate workout</button>
    {historyLoading||goalsLoading?<p className="helper-copy">Reading saved training and goals…</p>:null}{goalsWarning?<p role="status">{goalsWarning}</p>:null}
    {plan?.state==="needs-context"?<p role="status">Enter 5–360 minutes, or an advanced set target, to plan a workout.</p>:null}
    {plan&&plan.state!=="ready"&&plan.state!=="needs-context"?<p role="status">No workout fits the available catalog, equipment, time and recorded choices. Review the focus or advanced choices.</p>:null}
    {plan?.state==="ready"?<>
      <h3>{plan.focusLabel}</h3><p className="helper-copy">{plan.proposals.length} exercises · about {plan.totalEstimatedMinutes} minutes. Review this proposal before adding it.</p>
      <ul className="workout-plan-evidence">{plan.evidence.map(line=><li key={line}>{line}</li>)}</ul>
      <button type="button" className="primary-button compact-button" disabled={plan.proposals.every(s=>acceptedKeys.includes(key(s))||exists(s))} onClick={acceptAll}>Add workout to this session</button>
      <ol className="workout-whole-plan">{plan.proposals.map(s=>{const accepted=acceptedKeys.includes(key(s))||exists(s);return <li key={key(s)} className="workout-remaining-plan-option" data-name={s.name} data-sets={s.proposedSets}><div><strong>{s.selectionLabel}</strong><small>{s.proposedSets} planned {s.exerciseType==="duration"||s.exerciseType==="distance"?"blocks":"sets"} · {s.focusGroups.join(" + ")}{s.lastCompletedOn?` · last ${s.lastCompletedOn}`:" · no comparable history"}</small></div><div className="pill-row"><button type="button" className="ghost-button compact-button" aria-label={`Accept ${s.name}`} disabled={accepted} onClick={()=>accept(s)}>{accepted?"Added":"Add"}</button><button type="button" className="ghost-button compact-button" aria-label={`Replace ${s.name}`} disabled={accepted} onClick={()=>replace(s)}>Replace</button></div></li>;})}</ol>
    </>:null}
    {feedback?<p role="status" className="helper-copy">{feedback}</p>:null}
    <details className="workout-planning-disclosure"><summary>Planning estimates</summary><p className="helper-copy">Approximate transitions: 1 minute, strength sets: 2.5 minutes, timed blocks: 5 minutes. Default planned strength sets: 3. Actual pace and recovery vary. Enter your own reps and loads; nothing is completed automatically. Update time left and regenerate after more work.</p></details>
  </details>;
}
