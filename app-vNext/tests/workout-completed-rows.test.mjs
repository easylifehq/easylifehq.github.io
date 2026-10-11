import test from 'node:test';
import assert from 'node:assert/strict';
import { completedWorkoutRows } from '../src/features/easyworkout/domain/workoutCompletedRows.ts';
test('completed totals include explicitly completed warm-ups, never entered-only, deleted or invalid rows',()=>{
 const row={reps:12,weight:65,setType:'standard',completed:true};
 const sets=[row,{...row,reps:12,weight:70},{...row,reps:10,weight:80},{...row,reps:7,weight:95},{...row,setType:'warmup'},{...row,setType:'warmup',completed:false},{...row,deleted:true},{...row,weight:0}];
 const done=completedWorkoutRows({exerciseType:'weighted',sets});assert.equal(done.length,5);assert.equal(done.filter(s=>s.setType==='warmup').length,1);assert.deepEqual(sets[5],{...row,setType:'warmup',completed:false});
});
