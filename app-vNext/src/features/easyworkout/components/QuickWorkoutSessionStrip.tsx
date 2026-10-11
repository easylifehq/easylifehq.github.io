import { WORKOUT_FOCUS_GROUPS, WORKOUT_FOCUS_PRESETS, focusGroupsForPreset, focusPresetForGroups, type WorkoutFocusGroup, type WorkoutFocusPreset } from "@/features/easyworkout/domain/workoutPlanning";
type Props = {
  performedOn: string; onPerformedOnChange: (value: string) => void;
  focusGroups: WorkoutFocusGroup[]; focusPreset?: WorkoutFocusPreset | "Custom";
  onFocusGroupsChange: (groups: WorkoutFocusGroup[], preset?: WorkoutFocusPreset | "Custom") => void;
  sessionNotes: string; onSessionNotesChange: (value: string) => void;
};
export function QuickWorkoutSessionStrip({performedOn,onPerformedOnChange,focusGroups,focusPreset,onFocusGroupsChange,sessionNotes,onSessionNotesChange}: Props) {
  const preset = focusPreset || focusPresetForGroups(focusGroups);
  const abs = focusGroups.includes("Core");
  const cardio = focusGroups.includes("Conditioning") && preset !== "Cardio";
  const supplement = (group: WorkoutFocusGroup, checked: boolean) => onFocusGroupsChange(checked ? [...focusGroups.filter(g => g !== group).slice(0,4),group] : focusGroups.filter(g => g !== group),preset);
  return <div className="workout-session-strip workout-session-strip-clean">
    <label className="field-stack workout-strip-date"><span>Date</span><input type="date" value={performedOn} onChange={event=>onPerformedOnChange(event.target.value)} /></label>
    <div className="workout-strip-focus">
      <label className="field-stack"><span>Focus</span><select aria-label="Session focus" value={preset} onChange={event=>{
        const next=event.target.value as WorkoutFocusPreset;
        onFocusGroupsChange([...focusGroupsForPreset(next,abs),...(cardio && next!=="Cardio" ? ["Conditioning" as const] : [])],next);
      }}>{WORKOUT_FOCUS_PRESETS.map(choice=><option key={choice}>{choice}</option>)}{preset==="Custom" ? <option>Custom</option> : null}</select></label>
    </div>
    <details className="workout-muscles-picker"><summary className="ghost-button compact-button">Choose individual muscles</summary>
      <fieldset><legend>Muscles (up to 5)</legend><div className="workout-planning-choices">{WORKOUT_FOCUS_GROUPS.filter(group=>group!=="Core"&&group!=="Conditioning").map(group=><label key={group} className="workout-planning-choice"><input type="checkbox" disabled={!focusGroups.includes(group)&&focusGroups.length>=5} checked={focusGroups.includes(group)} onChange={event=>onFocusGroupsChange(event.target.checked?[...focusGroups,group]:focusGroups.filter(g=>g!==group),"Custom")} /><span>{group}</span></label>)}</div></fieldset>
      <div className="workout-supplement-choices"><label><input type="checkbox" aria-label="Add supplemental abs" checked={abs} onChange={event=>supplement("Core",event.target.checked)} /> Add abs</label>{preset!=="Cardio" ? <label><input type="checkbox" aria-label="Add supplemental cardio" checked={cardio} onChange={event=>supplement("Conditioning",event.target.checked)} /> Add cardio</label> : null}</div>
    </details>
    <label className="field-stack workout-strip-notes"><span>Session notes</span><input value={sessionNotes} onChange={event=>onSessionNotesChange(event.target.value)} placeholder="Energy, setup, etc." /></label>
  </div>;
}
