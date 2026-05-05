# EasyLife Next Variation Roadmap

## North Star

EasyLife should feel like Spencer's personal operating system: sleek, calm, high-tech, simple at first glance, and powerful underneath.

The product should no longer feel like a set of separate mini apps. Tasks, calendar, notes, email, school, workouts, planning, and optional life modules should feel like parts of one machine.

The default direction is Apple/Linear/Notion-inspired: restrained, useful, sharp, mobile-comfortable, and not toy-like. Themes may stay, but themes must change atmosphere, not the product architecture.

## Product Rules

- One primary job per screen.
- The first screen should answer what matters now.
- Hide secondary power behind clear entry points.
- Keep core modules visible and optional modules quiet.
- Favor useful daily action over feature inventory.
- Preserve working auth, data, Firebase, deploy, dependencies, and generated output.
- Do not make broad rewrites unless a human explicitly approves that phase scope.
- If a phase finishes early, improve proof, polish, empty states, mobile fit, and tests inside the current phase only.

## Core Structure

Primary nav:

- Today
- Calendar
- Tasks
- Notes
- Coach
- Inbox
- More

Optional modules under More:

- School
- Money
- People
- Fun / Drinks
- Projects
- Jobs
- Trips
- Future Plans
- Settings

Optional modules may be hidden, pinned, or surfaced only when relevant. They should not crowd the main daily path.

## Phase 0: Stabilize And Brief

Goal: make sure the fleet knows exactly what it is building before implementation.

Deliverables:

- Current-state audit of protected EasyLife.
- Next Variation product brief.
- Module map: core, optional, hidden.
- Visual direction brief.
- Anti-goals and forbidden scope.
- Phase command protocol.
- Phase 1 task packet.

Done when:

- The repo has one clear roadmap.
- The fleet has a phase-by-phase operating pattern.
- Future work can be requested with "implement phase N", "test phase N", "patch phase N", and "park phase N".

## Phase 1: Product Spine

Goal: turn EasyLife from separate apps into one unified system.

Deliverables:

- New information architecture plan for Today, Calendar, Tasks, Notes, Coach, Inbox, and More.
- Module visibility/toggle plan.
- Route and navigation inventory.
- First-screen command-center plan that is not a dashboard dump.
- Safe implementation slices for shell/nav/module grouping.

Implementation constraints:

- Keep behavior stable.
- Avoid backend/auth/Firebase/persistence changes.
- Avoid theme redesign except where needed to support structure.
- Do not build Phase 2 visual system yet.

Done when:

- Opening EasyLife immediately makes sense.
- The product reads as one Life OS within five seconds.
- Old app areas still have reachable paths.

## Phase 2: Visual System

Goal: replace the toy/dashboard feel with a polished Life OS visual language.

Deliverables:

- Refined token system.
- Calm default theme.
- Controlled card/surface rules.
- Better typography hierarchy.
- Shared spacing and responsive rules.
- Theme architecture that changes mood without changing layout.

Done when:

- EasyLife looks strong before any feature is explained.
- The default app feels sleek, calm, and high-tech.

## Phase 3: Today Engine

Goal: make the Today screen feel like the superpower.

Deliverables:

- Morning/evening brief.
- Next best move.
- Due today.
- Calendar pressure.
- Email follow-ups.
- School deadline surface.
- Energy/capacity signal.
- Quick capture.
- "Clear this first" priority.

Done when:

- The Today screen answers: "What should I do now?"
- The app is useful in a 30-second check.

## Phase 4: Command Layer

Goal: make EasyLife fast and futuristic without becoming visually loud.

Deliverables:

- Command palette.
- Natural-language capture surface.
- Fast actions for adding tasks, planning the day, turning email into tasks, making study plans, and asking what can be done in a time window.
- Keyboard-first desktop behavior.
- Tap-first mobile behavior.

Done when:

- Spencer can control the app without hunting through menus.

## Phase 5: Inbox Intelligence

Goal: make Gmail useful without turning EasyLife into an email client.

Deliverables:

- Gmail sync/import endpoint and UI entry point.
- Task detection.
- Deadline detection.
- Event detection.
- Follow-up detection.
- School/admin item detection.
- Approval queue before creating tasks/events.
- Suggested archive/keep/reply states.
- Draft reply support.

Done when:

- Email becomes a source of life objects, not inbox clutter.
- Nothing is created, archived, or sent without approval.

## Phase 6: School Planner

Goal: make EasyLife useful for classes, finals, assignments, and study planning.

Deliverables:

- Course model.
- Assignment and exam model.
- Syllabus/schedule import path.
- Grade-weight tracking.
- Study plan generator.
- Heavy-week warnings.
- "What should I study today?" view.
- Calendar/task integration.

Done when:

- School information can become a usable plan without manual re-entry of every detail.

## Phase 7: Capacity And Coach

Goal: make planning realistic, not just ambitious.

Deliverables:

- Daily capacity score.
- Calendar load.
- Task load.
- Workout/recovery signal.
- Sleep/energy manual input.
- Light/normal/push plan modes.
- Fitness coach dashboard.
- Workout logging and progression.

Done when:

- EasyLife helps Spencer choose a plan that fits the actual day.

## Phase 8: Notes And Memory

Goal: make notes part of the machine, not a separate drawer.

Deliverables:

- Notes tab redesign.
- Recent notes and search.
- Links from notes to tasks/events/classes/projects.
- Capture thought flow.
- Suggested follow-ups from notes.
- Stale-note review queue.

Done when:

- Notes can naturally become action, memory, or planning context.

## Phase 9: Optional Power Modules

Goal: add depth without clutter.

Deliverables:

- Money decisions.
- People/follow-up hub.
- Fun/drinks/games.
- Trip planner.
- Projects.
- Jobs.
- Future Plans dock.
- Module toggle, pin, and hide behavior.

Done when:

- EasyLife has lots of depth, but the main interface still feels simple.

## Phase 10: Mobile Superpower Pass

Goal: make EasyLife genuinely useful on a phone.

Deliverables:

- PWA/home-screen support review.
- Mobile nav.
- Thumb-friendly Today.
- Fast capture button.
- Mobile calendar/tasks.
- Inbox approval queue.
- Offline/local-first behavior where practical.
- No desktop dashboard squeezed into mobile.

Done when:

- Spencer can use EasyLife while studying, walking around, or checking the day.

## Phase 11: Themes

Goal: bring back the fun without letting themes wreck the product.

Deliverables:

- Theme tokens.
- Default sleek theme.
- Focus theme.
- Night theme.
- Soft theme.
- Controlled Candy theme.
- Theme preview screen.
- Contrast/accessibility checks per theme.

Done when:

- Themes feel like moods, not separate apps.

## Phase 12: QA, Polish, And Park

Goal: get EasyLife review-ready and fleet-safe.

Deliverables:

- Build passes.
- Visual QA desktop/mobile.
- Accessibility pass.
- Empty/loading/error states.
- Seed/demo data review.
- Screenshot review.
- Final checklist.
- Clean parked commit state.

Done when:

- EasyLife opens cleanly, looks strong, works on phone, and has no obvious broken flows.
