# EasyWorkout Field-Test Interrupt

Date: 2026-05-27

Status: `WORKOUT_FIELD_TEST_INTERRUPT_ACTIVE`

## Why This Interrupt Exists

The active task queue is still Stage 34 real push-notification planning, and the AI assistant lane remains parked at `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`.

The user started a real phone workout field test and found a higher-priority usability blocker: the workout logger still feels too easy to lose or fight during a live workout.

## Current Repair Focus

- Replace the boxed/dropdown header feel with a real sliding side navigation drawer.
- Keep Workout navigation in the drawer instead of per-page subnav.
- Protect active workout drafts from being wiped by view/mode changes.
- Keep active workout mode compact by collapsing inactive exercises.
- Make the next-exercise flow move forward without requiring extra scrolling.

## Parked Work

- Push notifications remain parked at Stage 34.
- Live AI assistant testing remains parked at `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`.
- Workout AI remains parked until the logger is reliable enough to test in the gym.

## Done Criteria

- `npm.cmd run build` passes from `app-vNext`.
- `/app/easyworkout/log?workoutMode=1` remains usable on phone width.
- Hamburger opens a left sliding drawer.
- Switching active/full workout views does not wipe active draft data.
- Workout AI is not added in this interrupt.
