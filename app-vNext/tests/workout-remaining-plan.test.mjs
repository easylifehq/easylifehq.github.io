import test from 'node:test';
import assert from 'node:assert/strict';
const engine=await import('../src/features/easyworkout/domain/workoutRemainingPlan.ts').catch(()=>({}));
import {defaultWorkoutPlanningContext} from '../src/features/easyworkout/domain/workoutPlanning.ts';
const option=(id,group,pattern,kind='weighted',equipment='dumbbell')=>({exerciseId:id,name:id,selectionLabel:id,muscleGroup:group,primaryMuscles:[group],secondaryMuscles:[],exerciseType:kind,planningMetadata:{focusGroups:[group],movementPattern:pattern,requiredEquipment:[equipment]}});
const choices=[option('Bench','Chest','horizontal-push'),option('Fly','Chest','horizontal-push'),option('Press','Shoulders','vertical-push'),option('Triceps','Triceps','elbow-extension'),option('Abs','Core','trunk','duration','bodyweight'),option('Treadmill','Conditioning','conditioning','duration','cardio-machine')];
const input=(budget={kind:'time',amount:45},patch={})=>({planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Chest','Shoulders','Triceps','Core']},budget,exerciseOptions:choices,exerciseLogs:[],history:{},defaultSetCount:3,...patch});
function derive(i=input()){assert.equal(typeof engine.deriveRemainingWorkoutPlan,'function');return engine.deriveRemainingWorkoutPlan(i)}
test('45 minutes produces multiple bounded exercises, with abs supplemental and no performed-row mutations',()=>{
 const i=input();const original=JSON.stringify(i);const p=derive(i);
 assert.equal(p.state,'ready');assert.ok(p.proposals.length>=3);assert.ok(p.totalEstimatedMinutes<=45);
 assert.ok(p.proposals.every(e=>e.proposedSets<=3));assert.equal(p.proposals.filter(e=>e.focusGroups.includes('Core')).length,1);
 assert.equal(p.proposals.at(-1).name,'Abs');assert.equal(JSON.stringify(i),original);
});
test('set budget is honored without elapsed-time assumptions and does not require a time budget',()=>{
 const p=derive(input({kind:'sets',amount:8}));
 assert.equal(p.totalPlannedSets,8);assert.equal(p.unusedBudget,0);assert.ok(p.proposals.length>=3);
 const noFit=derive(input({kind:'sets',amount:1}));assert.equal(noFit.totalPlannedSets,1);assert.equal(noFit.proposals.length,1);
});
test('trusted history informs suggestions only for matching load convention',()=>{
 const h={'id:Bench|load:per-hand':{performedOn:'2026-10-09',sourceSessionId:'synthetic',lastWeight:7.5,lastReps:10,lastSets:[{weight:7.5,reps:10}],sessionCount:1}};
 const p=derive(input({kind:'sets',amount:6},{history:h,exerciseOptions:choices.map(o=>o.name==='Bench'?{...o,loadMode:'per-hand'}:o)}));
 assert.equal(p.proposals.find(e=>e.name==='Bench')?.lastCompletedOn,'2026-10-09');
 const mismatch=derive(input({kind:'sets',amount:6},{history:h}));assert.ok(mismatch.proposals.every(e=>e.lastCompletedOn===null));
});
test('cardio supports timed blocks, limited equipment and honest missing-context results',()=>{
 const i=input({kind:'time',amount:15},{planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Conditioning','Core']}});
 const p=derive(i);assert.equal(p.proposals[0].name,'Treadmill');assert.ok(p.totalEstimatedMinutes<=15);assert.ok(p.proposals.some(e=>e.name==='Abs'));
 const limited=derive({...i,planningContext:{...i.planningContext,equipmentMode:'limited',availableEquipment:['bodyweight']}});assert.ok(limited.proposals.every(e=>e.name==='Abs'));
 const missing=derive({...i,planningContext:{...i.planningContext,focusGroups:[]}});assert.equal(missing.state,'needs-context');assert.equal(missing.proposals.length,0);
});
test('replacement changes only one proposal, stays in budget and forgets dislikes on a fresh plan',()=>{
 assert.equal(typeof engine.replaceRemainingWorkoutProposal,'function');
 const i=input({kind:'sets',amount:9});const p=derive(i);const target=p.proposals.find(e=>e.name==='Bench'||e.name==='Fly');
 assert.ok(target);const before=JSON.stringify(p);
 const r=engine.replaceRemainingWorkoutProposal(p,target.exerciseId,i);
 assert.notEqual(r.proposals.find(e=>e.name==='Bench'||e.name==='Fly').name,target.name);
 for(const e of p.proposals.filter(e=>e.name!==target.name))assert.deepEqual(r.proposals.find(v=>v.name===e.name),e);
 assert.ok(r.totalPlannedSets<=9);assert.equal(JSON.stringify(p),before);
 assert.deepEqual(derive(i),p);
});
test('unclassified completed work pauses a plan; completed, existing planned and conflicting identities are not invented',()=>{
 const i=input({kind:'sets',amount:9},{exerciseLogs:[{localId:'m',exerciseId:null,exerciseName:'Mystery',muscleGroup:'Chest',primaryMuscles:[],secondaryMuscles:[],exerciseType:'weighted',setup:{},notes:'',sets:[{reps:8,weight:100,completed:true,setType:'standard'}]}]});
 assert.equal(derive(i).state,'unclassified-completed');
 const draft={...i.exerciseLogs[0],exerciseId:'Bench',exerciseName:'Bench',sets:[{reps:0,weight:0,completed:false,setType:'standard'}]};
 assert.ok(derive({...i,exerciseLogs:[draft]}).proposals.every(e=>e.name!=='Bench'));
});

test('a one-set time slot can be replaced at the exact 3.5-minute fit boundary',()=>{
 const i=input({kind:'time',amount:7},{defaultSetCount:1,planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Chest']},exerciseOptions:[choices[0],choices[1],option('Alt','Chest','horizontal-push')]});
 const p=derive(i);assert.ok(p.proposals.length>0);
 const r=engine.replaceRemainingWorkoutProposal(p,p.proposals[0].exerciseId,i);
 assert.notEqual(r.proposals[0].name,p.proposals[0].name);assert.ok(r.totalEstimatedMinutes<=7);
});
test('malformed budget kinds do not generate a workout',()=>{
 assert.equal(derive(input({kind:'money',amount:8})).state,'needs-context');
});

test('replacing a main exercise does not reserve a second supplemental abs slot',()=>{
 const extras=[option('Crunch','Core','trunk','bodyweight','bodyweight')];
 const i=input({kind:'time',amount:25},{planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Chest','Shoulders','Core']},exerciseOptions:[choices[0],choices[2],choices[4],...extras]});
 const p=derive(i);const bench=p.proposals.find(e=>e.name==='Bench');assert.equal(bench.proposedSets,3);
 const r=engine.replaceRemainingWorkoutProposal(p,'Bench',{...i,exerciseOptions:[...i.exerciseOptions,choices[1]]});
 assert.equal(r.proposals.find(e=>e.name==='Fly').proposedSets,3);assert.ok(r.totalEstimatedMinutes<=25);
});

test('supplemental abs without a main session focus ask for context instead of becoming the whole plan',()=>{
 const p=derive(input({kind:'time',amount:20},{planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Core']}}));
 assert.equal(p.state,'needs-context');assert.equal(p.proposals.length,0);
});

test('an abs proposal can still be replaced individually after choosing a main focus',()=>{
 const i=input({kind:'time',amount:25},{planningContext:{...defaultWorkoutPlanningContext(),focusGroups:['Chest','Shoulders','Core']},exerciseOptions:[choices[0],choices[2],choices[4],option('Crunch','Core','trunk','bodyweight','bodyweight')]});
 const p=derive(i);const abs=p.proposals.find(e=>e.focusGroups.includes('Core'));assert.ok(abs);
 const r=engine.replaceRemainingWorkoutProposal(p,abs.exerciseId,i);
 assert.notEqual(r.proposals.find(e=>e.focusGroups.includes('Core')).name,abs.name);
 assert.ok(r.totalEstimatedMinutes<=25);
});
