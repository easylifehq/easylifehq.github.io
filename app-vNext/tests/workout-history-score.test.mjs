import test from 'node:test';
import assert from 'node:assert/strict';
import { workoutHistoryScore } from '../src/features/easyworkout/domain/workoutHistoryScore.ts';
const exercise={exerciseName:'DB Curl',exerciseType:'weighted',loadMode:'per-hand',exerciseId:null,sets:[{weight:10,reps:10,completed:true}],notes:''};
const session=(id,day,entry=exercise)=>({id,performedOn:day,schemaVersion:4,weightUnit:'lb',exercises:[entry]});
const current=session('current','2026-10-10');
const history=['01','02','03'].map(d=>session(d,'2026-10-'+d));
test('history index is 100 at own median; no effort or easy-day judgment',()=>assert.equal(workoutHistoryScore(current,history).score,100));
test('sparse, future, different mode, variant, type and set counts cannot invent a score',()=>{
 for(const other of [history.slice(0,2),history.map(s=>({...s,performedOn:'2026-10-11'})),history.map(s=>({...s,exercises:[{...exercise,loadMode:'total'}]})),history.map(s=>({...s,exercises:[{...exercise,exerciseName:'Hammer Curl'}]})),history.map(s=>({...s,exercises:[{...exercise,sets:[...exercise.sets,...exercise.sets]}]}))]) assert.equal(workoutHistoryScore(current,other).score,null);
 assert.equal(workoutHistoryScore(session('bw','2026-10-10',{...exercise,exerciseType:'bodyweight'}),history).score,null);
 assert.equal(workoutHistoryScore(current,[history[0],history[0],history[0]]).score,null);
});
