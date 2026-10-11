import type { WorkoutSessionRecord } from "../../../lib/firestore/workoutSessions.ts";
import type { WorkoutGoal } from "./workoutGoals.ts";
import { deriveRemainingWorkoutPlan, type RemainingWorkoutInput, type RemainingWorkoutPlan } from "./workoutRemainingPlan.ts";
import { workoutExerciseIdentityKey } from "./workoutLogAssist.ts";
import { focusGroupsForPreset, type WorkoutFocusGroup } from "./workoutPlanning.ts";
import { isValidLocalDateKey, isValidWorkingSet, shiftDateKey } from "./workoutStatistics.ts";

export type SessionWorkoutInput = RemainingWorkoutInput & { scope: "whole" | "continue"; nowDateKey: string; sessions: WorkoutSessionRecord[]; goals: WorkoutGoal[]; currentDraftId?: string };
export type SessionWorkoutPlan = RemainingWorkoutPlan & { scope: SessionWorkoutInput["scope"]; focusLabel: string; evidence: string[] };
const splits = ["Push", "Pull", "Legs"] as const;
const key = workoutExerciseIdentityKey;
export function prepareSessionWorkoutInput(source: SessionWorkoutInput) {
  const options = source.exerciseOptions;
  const resolve = (entry: { exerciseName: string; exerciseId?: string | null }) => {
    const matches = options.filter(option => entry.exerciseId ? entry.exerciseId === option.exerciseId : entry.exerciseName.trim().toLowerCase() === option.name.trim().toLowerCase());
    return matches.length === 1 && matches[0].planningMetadata ? matches[0] : undefined;
  };
  const recentCoverage: Partial<Record<WorkoutFocusGroup, number>> = {};
  const lastTrained: Partial<Record<WorkoutFocusGroup, string>> = {};
  const weekStart = isValidLocalDateKey(source.nowDateKey) ? shiftDateKey(source.nowDateKey, -6) : "";
  let completedSessions = 0, mappedSessions = 0, unmapped = 0;
  const seen = new Set<string>();
  for (const session of source.sessions) {
    if (!weekStart || seen.has(session.id) || (source.currentDraftId && session.clientDraftId === source.currentDraftId) || !isValidLocalDateKey(session.performedOn) || session.performedOn > source.nowDateKey || session.performedOn < weekStart) continue;
    seen.add(session.id);
    let credited = false, mapped = false;
    for (const entry of session.exercises) {
      const count = entry.sets.filter(set => isValidWorkingSet(set, entry.exerciseType || "weighted", { requiresExplicitCompletion: true })).length;
      if (!count) continue;
      credited = true;
      const option = resolve(entry);
      if (!option) { unmapped += 1; continue; }
      mapped = true;
      for (const group of option.planningMetadata!.focusGroups) {
        recentCoverage[group] = (recentCoverage[group] || 0) + count;
        if (!lastTrained[group] || session.performedOn > lastTrained[group]!) lastTrained[group] = session.performedOn;
      }
    }
    if (credited) completedSessions += 1;
    if (mapped) mappedSessions += 1;
  }
  const currentCoverage: Partial<Record<WorkoutFocusGroup, number>> = {};
  const classifiedLogs = source.exerciseLogs.filter(entry => {
    const option = resolve(entry);
    const count = entry.sets.filter(set => isValidWorkingSet(set, entry.exerciseType, { requiresExplicitCompletion: true })).length;
    if (!option) { if (count) unmapped += 1; return false; }
    if (count) option.planningMetadata!.focusGroups.forEach(group => { currentCoverage[group] = (currentCoverage[group] || 0) + count; });
    return true;
  });
  const explicitGroups = source.planningContext.focusGroups.filter(group => group !== "Core" && group !== "Conditioning");
  const any = source.planningContext.focusPreset === "Any" || (!source.planningContext.focusPreset && !explicitGroups.length && !source.planningContext.focusGroups.includes("Conditioning"));
  let main: WorkoutFocusGroup[] = explicitGroups;
  let focusLabel = explicitGroups.join(" + ");
  const evidence: string[] = [`${completedSessions} completed workouts in the last 7 days; only explicitly completed working sets inform recent coverage.`];
  if (any) {
    const currentTotal = Object.values(currentCoverage).reduce((a,b) => a + (b || 0), 0);
    if (source.scope === "continue" && currentTotal) {
      const split = [...splits].sort((a,b) => focusGroupsForPreset(b).reduce((sum,g) => sum + (currentCoverage[g] || 0),0) - focusGroupsForPreset(a).reduce((sum,g) => sum + (currentCoverage[g] || 0),0))[0];
      main = focusGroupsForPreset(split); focusLabel = `${split} continuation`; evidence.push(`Continuing the ${split.toLowerCase()} work already recorded in this workout.`);
    } else if (mappedSessions >= 2) {
      const average = (split: typeof splits[number]) => focusGroupsForPreset(split).reduce((sum,g) => sum + (recentCoverage[g] || 0),0) / focusGroupsForPreset(split).length;
      const split = [...splits].sort((a,b) => average(a) - average(b))[0];
      main = focusGroupsForPreset(split); focusLabel = `${split} workout`; evidence.push(`${split} is less represented in your recorded training this week; this is coverage, not a recovery diagnosis.`);
    } else {
      main = ["Chest", "Back", "Legs"]; focusLabel = "Balanced workout"; evidence.push("History is sparse or limited. Balanced push, pull and leg defaults are a starting point to review, not a personal prescription.");
    }
  } else if (source.planningContext.focusPreset === "Cardio" || (!main.length && source.planningContext.focusGroups.includes("Conditioning"))) {
    main = ["Conditioning"]; focusLabel = "Cardio workout";
  } else evidence.push("Your selected focus sets the main muscle coverage.");
  const extras = source.planningContext.focusGroups.filter(group => group === "Core" || (group === "Conditioning" && !main.includes("Conditioning")));
  const focusGroups = [...new Set([...main, ...extras])].slice(0, 5);
  const avoided = new Set(source.planningContext.avoidedExerciseKeys || []);
  const restDays = source.planningContext.recoveryDays || 0;
  const restStart = restDays && weekStart ? shiftDateKey(source.nowDateKey, -restDays + 1) : "";
  const permittedOptions = options.filter(option => !avoided.has(key(option)) && !(restStart && option.planningMetadata?.focusGroups.some(group => lastTrained[group] && lastTrained[group]! >= restStart)));
  if (avoided.size || restDays) evidence.push(`Recorded choices: ${avoided.size} exercise exclusions${restDays ? `; skip muscles trained within ${restDays} days` : ""}. No hand restrictions are inferred from freeform notes.`);
  const goalKeys = source.goals.filter(goal => goal.status === "active" && goal.goalType === "exercise-e1rm").flatMap(goal => permittedOptions.filter(option => Boolean(goal.exerciseId) && option.exerciseId === goal.exerciseId && option.planningMetadata?.focusGroups.some(group => focusGroups.includes(group))).map(option => key(option)));
  if (goalKeys.length) evidence.push("Active exercise goals help choose relevant movements. Goal target loads are not prescribed or copied into performed sets.");
  for (const goal of source.goals.filter(goal => goal.status === "active" && goal.goalType === "weekly-workouts")) evidence.push(`Recorded weekly workout goal: ${goal.target} sessions; it does not increase today's intensity.`);
  if (unmapped) evidence.push(`${unmapped} completed exercise entries are unmapped and not counted toward muscle coverage. Review the focus before accepting.`);
  const input: RemainingWorkoutInput = { ...source, defaultSetCount: Math.max(3, Math.min(4, source.defaultSetCount)), exerciseOptions: permittedOptions, exerciseLogs: source.scope === "continue" ? classifiedLogs : [], planningContext: { ...source.planningContext, focusGroups }, recentCoverage, goalKeys, excludedKeys: [...(source.excludedKeys || []), ...source.exerciseLogs.filter(e => e.exerciseName.trim()).map(e => key({ exerciseId: e.exerciseId, name: e.exerciseName }))] };
  return { input, focusLabel, evidence };
}
export function deriveSessionWorkoutPlan(source: SessionWorkoutInput): SessionWorkoutPlan {
  const prepared = prepareSessionWorkoutInput(source);
  const plan = deriveRemainingWorkoutPlan(prepared.input);
  const evidence = [...prepared.evidence];
  const missing = prepared.input.planningContext.focusGroups.filter(group => !plan.proposals.some(p => p.focusGroups.includes(group)));
  if (missing.length && plan.state === "ready") evidence.push(`No ${missing.join(" / ")} movement fits the remaining time, available catalog or recorded restrictions in this proposal.`);
  return { ...plan, scope: source.scope, focusLabel: prepared.focusLabel, evidence };
}
