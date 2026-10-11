import test from 'node:test';
import assert from 'node:assert/strict';
import * as planning from '../src/features/easyworkout/domain/workoutPlanning.ts';
import {hasWorkoutDraftWork,recoverWorkoutDraft} from '../src/features/easyworkout/domain/workoutDraftLifecycle.ts';
test('PPL and cardio focus use existing canonical groups with supplemental abs',()=>{
 assert.equal(typeof planning.focusGroupsForPreset,'function');
 assert.deepEqual(planning.focusGroupsForPreset('Push',true),['Chest','Shoulders','Triceps','Core']);
 assert.deepEqual(planning.focusGroupsForPreset('Pull',false),['Back','Biceps']);
 assert.deepEqual(planning.focusGroupsForPreset('Legs',true),['Legs','Hamstrings','Glutes','Core']);
 assert.deepEqual(planning.focusGroupsForPreset('Cardio',true),['Conditioning','Core']);
 assert.equal(planning.focusPresetForGroups(['Chest','Shoulders','Triceps','Core']),'Push');
 assert.equal(planning.focusPresetForGroups(['Back','Legs']),'Custom');
});
test('new full-gym context does not manufacture an active workout; explicit limited equipment does',()=>{
 assert.equal(typeof planning.defaultWorkoutPlanningContext,'function');
 const context=planning.defaultWorkoutPlanningContext();
 assert.deepEqual(context.availableEquipment,[...planning.WORKOUT_EQUIPMENT_KINDS]);assert.equal(context.equipmentMode,'full-gym');
 const draft={selectedRoutineId:'',durationMinutes:'',sessionNotes:'',exerciseLogs:[],planningContext:context};
 assert.equal(hasWorkoutDraftWork(draft),false);
 assert.equal(hasWorkoutDraftWork({...draft,planningContext:{...context,equipmentMode:'limited',availableEquipment:['dumbbell']}}),true);
});
test('remaining time or set budget survives recovery without changing actual duration or completion',()=>{
 const context=planning.normalizeWorkoutPlanningContext({focusGroups:['Back'],availableEquipment:['dumbbell'],plannedDurationMinutes:null,equipmentMode:'limited',remainingBudget:{kind:'sets',amount:9}});
 assert.deepEqual(context.remainingBudget,{kind:'sets',amount:9});
 assert.equal(context.equipmentMode,'limited');
 const restored=recoverWorkoutDraft({schemaVersion:7,ownerId:'synthetic',planningContext:context,durationMinutes:'',exerciseLogs:[{exerciseName:'Synthetic',sets:[{reps:0,weight:0}]}]}, {today:'2026-10-10',nowIso:'2026-10-10T00:00:00Z',ownerId:'synthetic',createId:()=> 'synthetic-id'}).draft;
 assert.deepEqual(restored.planningContext.remainingBudget,{kind:'sets',amount:9});assert.equal(restored.durationMinutes,'');assert.equal(restored.exerciseLogs[0].sets[0].completed,false);
 assert.equal(planning.normalizeWorkoutPlanningContext({...context,remainingBudget:{kind:'sets',amount:1.5}}).remainingBudget,undefined);
});
