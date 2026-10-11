import { deriveNextExerciseSuggestions, type WorkoutNextExerciseInput, type WorkoutNextExerciseResult, type WorkoutNextExerciseSuggestion } from "./workoutNextExercise.ts";
import { workoutExerciseIdentityKey } from "./workoutLogAssist.ts";

export type RemainingWorkoutBudget = { kind: "time" | "sets"; amount: number };
export type RemainingWorkoutInput = Omit<WorkoutNextExerciseInput, "elapsedSeconds"> & { budget?: RemainingWorkoutBudget; excludedKeys?: string[]; recentCoverage?: Partial<Record<string, number>>; goalKeys?: string[] };
export type RemainingWorkoutPlan = {
  state: WorkoutNextExerciseResult["state"];
  proposals: WorkoutNextExerciseSuggestion[];
  totalPlannedSets: number;
  totalEstimatedMinutes: number;
  unusedBudget: number;
  unclassifiedCompletedExercises: string[];
};
const key = workoutExerciseIdentityKey;
const isTimed = (option: WorkoutNextExerciseSuggestion) => option.exerciseType === "duration" || option.exerciseType === "distance";
const costPerSet = (option: WorkoutNextExerciseSuggestion) => isTimed(option) ? 5 : 2.5;
const cost = (option: WorkoutNextExerciseSuggestion, kind: RemainingWorkoutBudget["kind"]) => kind === "sets" ? option.proposedSets : option.estimatedMinutes;
const totals = (proposals: WorkoutNextExerciseSuggestion[], budget: RemainingWorkoutBudget) => ({
  totalPlannedSets: proposals.reduce((sum, entry) => sum + entry.proposedSets, 0),
  totalEstimatedMinutes: proposals.reduce((sum, entry) => sum + entry.estimatedMinutes, 0),
  unusedBudget: Math.max(0, budget.amount - proposals.reduce((sum, entry) => sum + cost(entry, budget.kind), 0)),
});

/** Allocate a remaining budget across distinct exercises; projected allocation never becomes performed data. */
export function deriveRemainingWorkoutPlan(input: RemainingWorkoutInput): RemainingWorkoutPlan {
  const budget = input.budget;
  const validBudget = budget && Number.isFinite(budget.amount) && (budget.kind === "time" ? budget.amount >= 3.5 && budget.amount <= 360 : budget.kind === "sets" && Number.isInteger(budget.amount) && budget.amount >= 1 && budget.amount <= 80);
  const blank: RemainingWorkoutPlan = { state: "needs-context", proposals: [], totalPlannedSets: 0, totalEstimatedMinutes: 0, unusedBudget: validBudget ? budget!.amount : 0, unclassifiedCompletedExercises: [] };
  if (!validBudget || !input.planningContext.focusGroups.some(group => group !== "Core")) return blank;
  // Reuse catalog trust, explicit-completion coverage, equipment filtering and history contracts.
  const ranked = deriveNextExerciseSuggestions({ ...input, elapsedSeconds: 0, includeTimedExercises: true, candidateLimit: 80,
    planningContext: { ...input.planningContext, plannedDurationMinutes: budget!.kind === "time" ? Math.max(5, Math.ceil(budget!.amount)) : 360 } });
  if (ranked.state !== "ready") return { ...blank, state: ranked.state, unclassifiedCompletedExercises: ranked.unclassifiedCompletedExercises };
  const excluded = new Set(input.excludedKeys || []);
  const available = ranked.suggestions.filter(entry => !excluded.has(key(entry)));
  const supplementalAbs = input.planningContext.focusGroups.includes("Core") && input.planningContext.focusGroups.some(group => group !== "Core");
  const supplementalCardio = input.planningContext.focusGroups.includes("Conditioning") && input.planningContext.focusGroups.some(group => group !== "Core" && group !== "Conditioning");
  const main = available.filter(entry => (!supplementalAbs || !entry.focusGroups.includes("Core")) && (!supplementalCardio || !entry.focusGroups.includes("Conditioning")));
  const abs = supplementalAbs ? available.filter(entry => entry.focusGroups.includes("Core")) : [];
  const cardio = supplementalCardio ? available.filter(entry => entry.focusGroups.includes("Conditioning")) : [];
  const allocationsByFocus = { ...ranked.coverage.completedSetsByFocus };
  for (const [group, count] of Object.entries(input.recentCoverage || {})) allocationsByFocus[group as keyof typeof allocationsByFocus] = (allocationsByFocus[group as keyof typeof allocationsByFocus] || 0) + (Number.isFinite(count) ? Math.max(0, count || 0) : 0);
  const allocationsByPattern = { ...ranked.coverage.completedSetsByPattern };
  const proposals: WorkoutNextExerciseSuggestion[] = [];
  let remaining = budget!.amount;
  function allocate(pool: WorkoutNextExerciseSuggestion[], maximum = 8) {
    while (pool.length && proposals.length < maximum && remaining > 0) {
      const focusCount = (entry: WorkoutNextExerciseSuggestion) => Math.min(...entry.focusGroups.map(group => allocationsByFocus[group] || 0));
      pool.sort((a, b) => focusCount(a) - focusCount(b) || Number((input.goalKeys || []).includes(key(b))) - Number((input.goalKeys || []).includes(key(a))) || (allocationsByPattern[a.movementPattern] || 0) - (allocationsByPattern[b.movementPattern] || 0) ||
        Number(a.lastCompletedOn === null) - Number(b.lastCompletedOn === null) || (a.lastCompletedOn || "").localeCompare(b.lastCompletedOn || "") || key(a).localeCompare(key(b)));
      const candidate = pool.shift()!;
      const fitting = budget!.kind === "sets" ? remaining : Math.floor((remaining - 1 + 1e-9) / costPerSet(candidate));
      const proposedSets = Math.min(Math.max(1, Math.floor(input.defaultSetCount) || 1), isTimed(candidate) ? 1 : 6, fitting);
      if (proposedSets < 1) continue;
      const proposal = { ...candidate, proposedSets, estimatedMinutes: 1 + proposedSets * costPerSet(candidate) };
      proposals.push(proposal);
      remaining -= cost(proposal, budget!.kind);
      proposal.focusGroups.forEach(group => { allocationsByFocus[group] = (allocationsByFocus[group] || 0) + proposedSets; });
      allocationsByPattern[proposal.movementPattern] = (allocationsByPattern[proposal.movementPattern] || 0) + proposedSets;
    }
  }
  // Reserve room for one supplemental abs block if the main workout can still fit.
  const supplementCost = budget!.kind === "sets" ? 1 : 6;
  const reserve = main.length ? (Number(abs.length > 0) + Number(cardio.length > 0)) * supplementCost : 0;
  if (remaining - reserve >= (budget!.kind === "sets" ? 1 : 3.5)) remaining -= reserve;
  else { abs.length = 0; cardio.length = 0; }
  allocate(main, 6);
  if (abs.length) { if (reserve) remaining += supplementCost; allocate(abs, proposals.length + 1); }
  if (cardio.length) { if (reserve) remaining += supplementCost; allocate(cardio, proposals.length + 1); }
  return { ...blank, state: proposals.length ? "ready" : "no-candidates", proposals, ...totals(proposals, budget!) };
}

/** Replace one slot only. Exclusion is scoped to this action, never written as an exercise dislike. */
export function replaceRemainingWorkoutProposal(plan: RemainingWorkoutPlan, proposalKey: string, input: RemainingWorkoutInput): RemainingWorkoutPlan {
  const index = plan.proposals.findIndex(entry => entry.exerciseId === proposalKey || key(entry) === proposalKey);
  if (index < 0 || !input.budget) return plan;
  const current = plan.proposals[index];
  const others = plan.proposals.filter((_, i) => i !== index);
  const availableBudget = input.budget.amount - others.reduce((sum, entry) => sum + cost(entry, input.budget!.kind), 0);
  const replacement = deriveRemainingWorkoutPlan({ ...input, exerciseOptions: input.exerciseOptions.filter(option => option.planningMetadata?.focusGroups.some(group => current.focusGroups.includes(group))), budget: { ...input.budget, amount: availableBudget }, excludedKeys: [...(input.excludedKeys || []), key(current), ...others.map(key)] });
  const candidate = replacement.proposals[0];
  if (!candidate) return plan;
  const proposals = plan.proposals.map((entry, i) => i === index ? candidate : entry);
  return { ...plan, proposals, ...totals(proposals, input.budget) };
}
