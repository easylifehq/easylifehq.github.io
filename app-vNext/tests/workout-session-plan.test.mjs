import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSessionWorkoutPlan } from '../src/features/easyworkout/domain/workoutSessionPlan.ts';
import { defaultWorkoutPlanningContext } from '../src/features/easyworkout/domain/workoutPlanning.ts';
const option=(name,group,pattern)=>({name,selectionLabel:name,exerciseId:name.toLowerCase(),exerciseType:'weighted',muscleGroup:group,primaryMuscles:[group],secondaryMuscles:[],planningMetadata:{focusGroups:[group],movementPattern:pattern,requiredEquipment:['dumbbell']}});
const options=[option('Bench','Chest','horizontal-push'),option('Press','Shoulders','vertical-push'),option('Row','Back','horizontal-pull'),option('Pulldown','Back','vertical-pull'),option('Curl','Biceps','elbow-flexion-supinated'),option('Squat','Legs','squat'),option('Hinge','Hamstrings','hinge')];
const row={reps:10,weight:30,setType:'standard',completed:true,deleted:false};
const entry=(name,completed=true)=>({exerciseId:name.toLowerCase(),exerciseName:name,exerciseType:'weighted',sets:[{...row,completed}],notes:''});
const session=(id,day,name='Bench',completed=true)=>({id,performedOn:day,schemaVersion:4,weightUnit:'lb',exercises:[entry(name,completed)]});
const input=(patch={})=>({planningContext:defaultWorkoutPlanningContext(),budget:{kind:'time',amount:45},scope:'whole',nowDateKey:'2026-10-10',defaultSetCount:1,exerciseOptions:options,exerciseLogs:[],history:{},sessions:[],goals:[],...patch});
test('Any with sparse completed history produces an honest balanced whole workout within time, never performed rows',()=>{
 const p=deriveSessionWorkoutPlan(input());assert.equal(p.state,'ready');assert.match(p.focusLabel,/balanced/i);assert.ok(p.proposals.some(e=>e.focusGroups.includes('Chest')));assert.ok(p.proposals.some(e=>e.focusGroups.includes('Back')));assert.ok(p.proposals.some(e=>e.focusGroups.includes('Legs')));assert.ok(p.totalEstimatedMinutes<=45);assert.match(p.evidence.join(' '),/sparse|limited/i);
});
test('Any uses only recent completed records, excludes active draft and future sessions, and favors less represented split',()=>{
 const sessions=[session('a','2026-10-08'),session('b','2026-10-09'),session('future','2026-10-11','Row'),session('planned','2026-10-09','Squat',false),{...session('active','2026-10-10','Row'),clientDraftId:'active-draft'}];
 const p=deriveSessionWorkoutPlan(input({sessions,currentDraftId:'active-draft'}));assert.match(p.focusLabel,/pull/i);assert.ok(p.proposals.every(e=>e.focusGroups.some(g=>['Back','Biceps'].includes(g))));assert.match(p.evidence.join(' '),/2.*completed/i);
});
test('continuing a current workout uses completed coverage, excludes existing queue and never changes entered sets',()=>{
 const logs=[{...entry('Pulldown'),localId:'current',muscleGroup:'Back'}];const before=JSON.stringify(logs);
 const p=deriveSessionWorkoutPlan(input({scope:'continue',exerciseLogs:logs}));assert.match(p.focusLabel,/pull/i);assert.ok(p.proposals.every(e=>e.name!=='Pulldown'));assert.equal(JSON.stringify(logs),before);
});
test('active exercise goals influence exercise choice without prescribing target loads; paused goals do not',()=>{
 const goal={id:'goal',status:'active',goalType:'exercise-e1rm',exerciseId:'bench',exerciseName:'Bench',target:300};
 const p=deriveSessionWorkoutPlan(input({goals:[goal]}));assert.equal(p.proposals[0].name,'Bench');assert.match(p.evidence.join(' '),/goal/i);assert.ok(p.proposals.every(e=>!('weight' in e)));
 const paused=deriveSessionWorkoutPlan(input({goals:[{...goal,status:'paused'}]}));assert.doesNotMatch(paused.evidence.join(' '),/Bench goal/);
});
test('only recorded avoidance/rest preferences restrict exercises; freeform hand notes are not interpreted',()=>{
 const p=deriveSessionWorkoutPlan(input({planningContext:{...defaultWorkoutPlanningContext(),avoidedExerciseKeys:['id:bench'],recoveryDays:2},sessions:[session('recent','2026-10-09','Row')]}));assert.ok(p.proposals.every(e=>e.name!=='Bench'&&!e.focusGroups.includes('Back')));
 const freeform=deriveSessionWorkoutPlan(input({sessions:[{...session('old','2026-09-01'),notes:'hand limitation'}]}));assert.ok(freeform.proposals.some(e=>e.name==='Bench'));
});
test('unknown completed exercises are reported honestly while known coverage can still guide a plan',()=>{
 const p=deriveSessionWorkoutPlan(input({scope:'continue',exerciseLogs:[{...entry('Unknown'),localId:'unknown'}]}));assert.equal(p.state,'ready');assert.match(p.evidence.join(' '),/unmapped|not.*mapped/i);
});

test('two unmapped completed sessions do not invent a personalized split',()=>{const p=deriveSessionWorkoutPlan(input({sessions:[session('u1','2026-10-08','Unknown'),session('u2','2026-10-09','Unknown')]}));assert.match(p.focusLabel,/balanced/i);assert.match(p.evidence.join(' '),/unmapped/);});
