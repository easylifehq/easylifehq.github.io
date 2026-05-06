# EasyLife AI Personal Assistant Rebuild Plan

## North Star

EasyLife should feel like one clean AI personal assistant, not a suite of little apps.

The app should be calm, fast, mobile-first, and powerful underneath. The first screen should answer one question: what needs my attention now?

The assistant may have many abilities, but the interface should not brag about them all at once. Depth should appear only when asked for.

## What Went Wrong

- The product exposed too many modules at once.
- The home screen became a dashboard instead of an assistant.
- Visual polish was attempted before the information architecture was fixed.
- Themes were treated as the problem when the real problem was clutter, hierarchy, and confusing product shape.
- The fleet was given broad beauty goals instead of tight simplification gates.

## Rebuild Rules

- One primary job per screen.
- Default to hiding features until they are relevant.
- Preserve useful capability, but delete or hide UI that gets in the way.
- Mobile is the primary design target; desktop is the expanded version.
- No backend, auth, Firebase rules/config, payments, dependency/package, deploy config, generated output, secrets, or broad persistence changes unless a human explicitly approves a later phase.
- The fleet must not add new visible modules during Phase 0 or Phase 1.
- Each implementation task must remove or simplify at least one confusing element.
- Each phase must end with `npm.cmd run build`, a short review note, and a clean commit.

## Stage 0: Salvage Audit And Reset Packet

Goal: decide what stays, what hides, and what must be removed before implementation.

Deliverables:

- Audit current protected EasyLife screens.
- Identify confusing, redundant, or low-value surfaces.
- Classify features as core, support, optional, hidden, or remove.
- Decide which recent HQ changes should be kept, reverted, or replaced.
- Write a minimal target IA for the assistant.
- Seed Stage 1 tasks only after the audit is complete.

Done when:

- The fleet has a deletion/hide list.
- The next tasks are small and cannot accidentally create another dashboard.
- EasyLife is clean, build-passing, and parked.

## Stage 1: One Assistant Shell

Goal: collapse the product shape from many apps into one assistant with a few clear areas.

Target navigation:

- Today
- Inbox
- Plan
- Notes
- More

Core surfaces:

- Today: next action, capture, today timeline, priority, capacity.
- Inbox: email/import suggestions, loose captures, deadlines, follow-ups.
- Plan: calendar, tasks, study/work blocks, scheduling.
- Notes: memory and writing.
- More: workouts, school, people, projects, money, fun, settings.

Done when:

- Opening EasyLife reads as one assistant within five seconds.
- Old modules remain reachable but stop crowding the main path.
- No screen looks like a feature inventory.

## Stage 2: Today Minimal Surface

Goal: rebuild the first screen as the daily command surface.

Required first viewport:

- One brief sentence.
- One next best move.
- One capture bar.
- One small today strip.
- One quiet way to open deeper context.

Forbidden in first viewport:

- module grids
- repeated cards
- large feature panels
- decorative dashboard blocks
- more than three primary choices

Done when:

- The first screen is useful in 30 seconds.
- It feels sleek, quiet, and obvious.

## Stage 3: Assistant Inbox

Goal: turn incoming material into approved life objects.

Inputs:

- Gmail import/sync suggestions.
- Manual capture.
- Notes that need action.
- Calendar/deadline hints.

Outputs:

- task suggestion
- event suggestion
- deadline suggestion
- follow-up suggestion
- draft reply suggestion
- ignore/archive suggestion

Done when:

- Nothing is created, archived, or sent without approval.
- Inbox is an assistant queue, not an email client.

## Stage 4: Planning Engine

Goal: make the assistant build a realistic day plan.

Inputs:

- tasks
- events
- deadlines
- school load
- email follow-ups
- energy/capacity
- workouts

Outputs:

- light day
- normal day
- push day
- recovery day
- suggested time blocks

Done when:

- EasyLife can answer: what can I realistically do today?

## Stage 5: Notes And Memory

Goal: make notes feed the assistant instead of becoming a separate app.

Deliverables:

- recent notes
- note search
- note-to-task
- note-to-event
- stale-note review
- pinned context

Done when:

- Notes naturally become action, memory, or planning context.

## Stage 6: School Layer

Goal: make school planning a real superpower without crowding Today.

Deliverables:

- course model UI
- assignment/exam review queue
- syllabus/schedule import prototype
- study load warning
- calendar/task creation from school items

Done when:

- School information can become a usable plan with minimal manual re-entry.

## Stage 7: Fitness And Capacity Coach

Goal: connect workouts to daily planning.

Deliverables:

- quick workout log
- training trend
- energy/capacity input
- lighter/harder training recommendation
- plan mode integration

Done when:

- The app helps choose a plan that fits the actual day.

## Stage 8: Optional Power Modules

Goal: add depth without clutter.

Modules:

- people/follow-ups
- money decisions
- projects
- jobs
- fun/drinks
- trips
- future plans

Done when:

- Optional modules can be turned on, pinned, hidden, or ignored.

## Stage 9: Visual System

Goal: make the simplified product feel premium.

Rules:

- Keep the theme mood the user liked.
- Themes tint the app; they do not define layout.
- No dashboard soup.
- No huge module grids on Today.
- Fewer borders.
- Strong typography hierarchy.
- Clear tap targets.
- Mobile first.

Done when:

- The app feels clean and sleek before any feature explanation.

## Stage 10: Mobile And PWA

Goal: make EasyLife useful on the phone.

Deliverables:

- home-screen flow
- thumb-friendly nav
- fast capture
- Today mobile pass
- Inbox approval mobile pass
- calendar/task mobile pass

Done when:

- The phone version feels like the main product, not a squeezed desktop.

## Stage 11: Assistant Actions

Goal: make the assistant prepare work without taking unsafe actions.

Deliverables:

- draft email replies
- summarize inbox
- suggest schedule blocks
- generate study plan
- surface stale tasks/notes
- review before action

Done when:

- The assistant feels powerful but stays under user control.

## Stage 12: Park And Review

Goal: get to a trustworthy review-ready state.

Deliverables:

- build passing
- mobile/desktop visual QA
- accessibility pass
- deleted clutter documented
- review notes
- clean commit

Done when:

- EasyLife is clean, parked, and ready for user review.

## Fleet Trust Protocol

We can trust the fleet only with these constraints:

- Stage 0 and Stage 1 use `BatchSize 1`.
- No stage may start until the previous stage has a review note.
- The fleet may remove/hide UI, but must not add a new dashboard.
- Each task must name the exact screen or file area it owns.
- Each task must include an anti-goal.
- If a visual task creates more visible boxes, it should fail review.
- If a task cannot explain what it removed or simplified, it should fail review.
