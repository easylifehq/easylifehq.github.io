import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWorkoutExerciseName, workoutQuickNoteChoices } from '../src/features/easyworkout/domain/workoutEntryHelpers.ts';
test('new draft display names preserve acronyms and normalize whitespace',()=>assert.equal(formatWorkoutExerciseName('  db lateral   raise with EZ bar '),'DB Lateral Raise With EZ Bar'));
test('learned notes stay with exact variant, type and load mode; duplicates collapse',()=>{
 const exercise={exerciseName:'Cable Pec Fly (middle)',exerciseType:'weighted',loadMode:'total'};
 const entry={...exercise,notes:'Seat 3'};
 const sessions=[{performedOn:'2026-10-10',exercises:[entry,{...entry,notes:'seat 3'},{...entry,exerciseName:'Lat Pulldown',notes:'Wide grip'},{...entry,exerciseName:'Cable Pec Fly (high to low)',notes:'High cable'},{...entry,loadMode:'per-hand',notes:'Each note'}]}];
 assert.deepEqual(workoutQuickNoteChoices(sessions,exercise),['Seat 3']);
 assert.deepEqual(workoutQuickNoteChoices(sessions,{...exercise,exerciseId:'different-machine'}),[]);
});
