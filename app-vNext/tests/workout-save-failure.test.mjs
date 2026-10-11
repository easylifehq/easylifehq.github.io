import test from 'node:test';
import assert from 'node:assert/strict';
import { workoutSaveFailureMessage } from '../src/features/easyworkout/domain/workoutSaveFailure.ts';
test('save failures identify authentication, permission, network, quota and unknown causes without claiming a save', () => {
  assert.match(workoutSaveFailureMessage({code:'permission-denied'}), /access.*draft retained/i);
  assert.match(workoutSaveFailureMessage({code:'unauthenticated'}), /sign-in.*draft retained/i);
  assert.match(workoutSaveFailureMessage({code:'unavailable'}), /server.*draft retained/i);
  assert.match(workoutSaveFailureMessage({code:'resource-exhausted'}), /busy.*draft retained/i);
  assert.match(workoutSaveFailureMessage({code:'invalid-argument'}), /rejected.*draft retained/i);
  assert.match(workoutSaveFailureMessage(new Error('private detail')), /not confirmed.*draft retained/i);
  assert.doesNotMatch(workoutSaveFailureMessage(new Error('private detail')), /private detail|connection is ready/);
});
