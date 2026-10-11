import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveExerciseHistory, findExerciseHistory, buildWorkoutExerciseOptions, fillSetsFromLastPerformance } from '../src/features/easyworkout/domain/workoutLogAssist.ts';
import { deriveWorkoutStatistics } from '../src/features/easyworkout/domain/workoutStatistics.ts';
import { recoverWorkoutDraft } from '../src/features/easyworkout/domain/workoutDraftLifecycle.ts';
import { applyExerciseIdentityEdit, completeExercise } from '../src/features/easyworkout/domain/workoutExerciseCompletion.ts';
import { PEC_FLY_VARIANTS } from '../src/features/easyworkout/domain/workoutLoadMode.ts';
const row = { localId:'set-1', reps:10, weight:7.5, notes:'', completed:true, deleted:false, rir:null, setType:'standard' };
const ex = (loadMode) => ({ localId:'exercise-1', exerciseId:'fly', exerciseName:'Cable Pec Fly (middle)', muscleGroup:'Chest', primaryMuscles:['Chest'], secondaryMuscles:[], exerciseType:'weighted', setup:{}, notes:'', sets:[{...row}], ...(loadMode ? {loadMode} : {}) });
const session = (id, loadMode, date) => ({ id, schemaVersion:4, performedOn:date, weightUnit:'lb', routineId:null, routineName:'Synthetic', durationMinutes:10, notes:'', exercises:[ex(loadMode)], createdAt:null, updatedAt:null });
test('load modes retain historical bytes and isolate prior hints and records', () => {
 const sessions = [session('old', undefined,'2026-10-07'),session('total','total','2026-10-08'),session('hand','per-hand','2026-10-09')];
 const original = JSON.stringify(sessions);
 const history=deriveExerciseHistory(sessions,'lb');
 for (const [mode,id] of [[undefined,'old'],['total','total'],['per-hand','hand']]) {
  const prior=findExerciseHistory(history,'Cable Pec Fly (middle)','fly',mode);
  assert.equal(prior.sourceSessionId,id); assert.equal(prior.lastWeight,7.5); assert.equal(prior.sessionCount,1);
 }
 const stats=deriveWorkoutStatistics(sessions,{nowDateKey:'2026-10-10',displayUnit:'lb'});
 assert.equal(stats.exerciseSummaries.length,3);
 assert.ok(stats.exerciseSummaries.every(s=>s.sessionCount===1));
 assert.equal(JSON.stringify(sessions),original);
 const copied=fillSetsFromLastPerformance([{...row,completed:false,weight:0}],findExerciseHistory(history,'Cable Pec Fly (middle)','fly','per-hand'));
 assert.equal(copied[0].weight,7.5); assert.equal(copied[0].completed,false);
 assert.equal(findExerciseHistory(deriveExerciseHistory([sessions[0]],'lb'),'Cable Pec Fly (middle)','fly','per-hand'),undefined);
});
test('mode switches revoke completion but never convert values; draft recovery preserves mode', () => {
 const changed=applyExerciseIdentityEdit(ex('total'),{loadMode:'per-hand'});
 assert.equal(changed.sets[0].completed,false); assert.equal(changed.sets[0].weight,7.5);
 const done=completeExercise(changed).exercise;
 const recovered=recoverWorkoutDraft({schemaVersion:7,ownerId:'synthetic',exerciseLogs:[done]}, {ownerId:'synthetic',today:'2026-10-10',nowIso:'2026-10-10T12:00:00Z',createId:()=> 'synthetic-id'});
 assert.equal(recovered.draft.exerciseLogs[0].loadMode,'per-hand'); assert.equal(recovered.draft.exerciseLogs[0].sets[0].weight,7.5);
 const legacy=recoverWorkoutDraft({schemaVersion:7,exerciseLogs:[ex()]},{ownerId:'synthetic',today:'2026-10-10',nowIso:'2026-10-10T12:00:00Z',createId:()=> 'synthetic-id'});
 assert.equal(legacy.draft.exerciseLogs[0].loadMode,undefined);
});
test('pec fly variants and newest weight convention return as independent choices', () => {
 const sessions=[session('hand','per-hand','2026-10-09'), session('total','total','2026-10-08')];
 const defaults=PEC_FLY_VARIANTS.map(name=>({name,muscleGroup:'Chest'}));
 const options=buildWorkoutExerciseOptions([],sessions,defaults);
 assert.equal(options.length,4);
 assert.equal(options.find(o=>o.name==='Cable Pec Fly (middle)').loadMode,'per-hand');
 const history=deriveExerciseHistory([{...sessions[0],exercises:[{...ex('per-hand'),exerciseId:null}]}],'lb');
 assert.equal(findExerciseHistory(history,'Cable Pec Fly (high to low)',null,'per-hand'),undefined);
});

test('a newer unspecified convention never borrows an older explicit convention', () => {
 const options=buildWorkoutExerciseOptions([], [session('new',undefined,'2026-10-10'),session('old','per-hand','2026-10-09')],[]);
 assert.equal(options[0].loadMode,undefined);
});
