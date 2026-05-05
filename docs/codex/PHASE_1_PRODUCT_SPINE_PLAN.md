# Phase 1 Product Spine Plan

## Current Protected Structure

Current shell:

- `app-vNext/src/app/layouts/AuthenticatedLayout.tsx`
- `app-vNext/src/components/navigation/AppHeader.tsx`
- `app-vNext/src/components/navigation/ProductsMenu.tsx`
- `app-vNext/src/components/navigation/appProducts.ts`
- shared styles in `app-vNext/src/styles/`

Current protected routes:

- `/app/hq` -> `features/hq/routes/HQPage.tsx`
- `/app/command` -> `features/hq/routes/CommandCenterPage.tsx`
- `/app/easylist/...` -> tasks, add/capture, email, archive, deleted
- `/app/easycalendar/...` -> day and month planning
- `/app/easynotes/...` -> notes library, new note, editor, trash
- `/app/easypipeline/...` -> job/application pipeline and email
- `/app/easycontacts` -> contacts
- `/app/easyprojects/...` -> projects home, detail, timeline
- `/app/easyworkout/...` -> workout dashboard, routines, log
- `/app/easystatistics` -> stats
- `/app/settings` -> settings

Current product issue:

- The shell still reads as EasyHQ plus an Apps switcher.
- Route names and menu labels make the product feel like many separate apps.
- Command and experimental surfaces compete with the core daily path.
- Optional areas are first-class in the menu before the new Life OS hierarchy is established.

## Target Phase 1 Structure

Primary nav labels:

- Today -> current HQ/opening surface
- Calendar -> EasyCalendar
- Tasks -> EasyList
- Notes -> EasyNotes
- Coach -> EasyWorkout plus capacity/fitness direction
- Inbox -> email-derived tasks/follow-ups, initially existing EasyList email/import surfaces
- More -> optional modules and settings

Optional modules under More:

- School: future module
- Money: future module
- People: existing EasyContacts
- Fun / Drinks: future module
- Projects: existing EasyProjects
- Jobs: existing EasyPipeline
- Trips: future module
- Future Plans: future module
- Stats: existing EasyStatistics
- Settings: existing Settings

## Safe Phase 1 Slices

### Slice 1: Navigation language and grouping

Safe target files:

- `app-vNext/src/components/navigation/appProducts.ts`
- `app-vNext/src/components/navigation/AppHeader.tsx`
- `app-vNext/src/components/navigation/ProductsMenu.tsx`
- small shared style edits if required

Expected outcome:

- Menu labels move toward Today, Calendar, Tasks, Notes, Coach, Inbox, More.
- Existing routes stay intact.
- Existing visibility settings still work.
- Optional modules become quieter without disappearing.

### Slice 2: Protected opening surface

Safe target files:

- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `app-vNext/src/features/hq/routes/CommandCenterPage.tsx` only if currently visible as a primary daily surface
- small shared style edits if required

Expected outcome:

- First viewport emphasizes next move, today context, and fast capture.
- Avoids feature inventory.
- Keeps existing local/app data and behavior.

### Slice 3: Optional module entry point

Safe target files:

- `app-vNext/src/components/navigation/appProducts.ts`
- `app-vNext/src/components/navigation/ProductsMenu.tsx`
- `app-vNext/src/features/settings/routes/SettingsPage.tsx` only if the module toggle UI needs wording clarity

Expected outcome:

- More-style grouping makes optional modules discoverable but quiet.
- Core daily path stays obvious.
- No route removal.

### Slice 4: Review and park

Safe target files:

- `docs/codex/PHASE_1_REVIEW.md`
- only tiny Phase 1 bugfixes if required by checks

Expected outcome:

- Build passes.
- Key routes are inspected.
- Phase 2 readiness is explicit.

## Forbidden In Phase 1

- New backend or Gmail sync work.
- Auth changes.
- Firebase rules/config changes.
- Persistence or data-shape changes.
- Package/dependency edits.
- Generated/root deploy output.
- Theme redesign.
- Candy/focus/night theme implementation.
- School planner implementation.
- Capacity scoring implementation.
- Large route rewrites.

## Phase 1 Done Criteria

- EasyLife reads as one Life OS, not a list of separate branded apps.
- Today/Calendar/Tasks/Notes/Coach/Inbox/More direction is visible.
- Optional modules are reachable but quieter.
- First protected viewport has one clear daily job.
- `npm.cmd run build` passes from `app-vNext`.
- The repo is clean after commit.
