# AI Assistant Stage 0 Audit

## Scope

Protected EasyLife screens inspected:

- `/app/hq?visualQa=1` in `app-vNext/src/features/hq/routes/HQPage.tsx`
- `/app/command` in `app-vNext/src/features/hq/routes/CommandCenterPage.tsx`
- `/app/easylist/dashboard?visualQa=1` in `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx`
- `/app/easycalendar/month?visualQa=1` in `app-vNext/src/features/easycalendar/routes/EasyCalendarMonthPage.tsx`
- `/app/easynotes` in `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx`
- `/app/easyworkout/dashboard`, `/app/easyworkout/log`, and `/app/easyworkout/routines` through `app-vNext/src/features/easyworkout/layouts/EasyWorkoutLayout.tsx`
- `/settings?visualQa=1` redirected to `/app/settings?visualQa=1` in `app-vNext/src/features/settings/routes/SettingsPage.tsx`
- Protected shell/navigation in `app-vNext/src/app/router/index.tsx`, `app-vNext/src/components/navigation/AppHeader.tsx`, `app-vNext/src/components/navigation/AppWorkspaceHeader.tsx`, and `app-vNext/src/components/navigation/appProducts.ts`

No product files were edited.

## Core Surfaces To Keep

- Keep `/app/hq` as the assistant start route, but simplify it to one first job: next move, brief today read, capture, and one quiet context opener. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Keep `/app/easylist/add` as the manual capture route for loose tasks and deadlines. It should become a primary assistant Inbox/Capture destination, not a separate app billboard. Files: `app-vNext/src/app/router/index.tsx`, `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`.
- Keep `/app/easylist/dashboard` as the task review queue because it already starts with "Next up" and compact counts. It should sit under Inbox or Today, not compete as "EasyList" in top-level navigation. Files: `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx`, `app-vNext/src/features/easylist/layouts/EasyListLayout.tsx`.
- Keep `/app/easycalendar/day` as the Plan surface for placing work into time. The month view can remain reachable, but day planning is closer to the assistant job. Files: `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx`, `app-vNext/src/features/easycalendar/routes/EasyCalendarMonthPage.tsx`.
- Keep `/app/easynotes` and `/app/easynotes/new` as Notes and fast memory capture. The current library lead is simple enough to keep, but its editing/search tools should stay secondary. File: `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx`.
- Keep `/app/settings` as support, with everyday controls first. It should not read as a launch/distribution/admin dashboard for normal users. File: `app-vNext/src/features/settings/routes/SettingsPage.tsx`.

## Support Surfaces To Keep Quiet

- Keep `/app/easylist/email`, but label it as an approval-first Inbox review layer rather than a major daily app. Files: `app-vNext/src/features/easylist/routes/EasyListEmailPage.tsx`, `app-vNext/src/features/easylist/layouts/EasyListLayout.tsx`.
- Keep `/app/command` as a deeper command/review surface, but remove it from the default mental model until the assistant shape is clear. Files: `app-vNext/src/features/hq/routes/CommandCenterPage.tsx`, `app-vNext/src/components/navigation/appProducts.ts`.
- Keep `/app/settings?section=customize`, `/app/settings?section=apps`, `/app/settings?section=calendar`, `/app/settings?section=notifications`, and `/app/settings?section=account` as quiet Settings sections. They should be grouped under one Settings entry, not surfaced as daily work. File: `app-vNext/src/features/settings/routes/SettingsPage.tsx`.
- Keep `/app/easycalendar/month` as a scan view, but the primary assistant Plan route should point to `/app/easycalendar/day`. Files: `app-vNext/src/app/router/index.tsx`, `app-vNext/src/features/easycalendar/routes/EasyCalendarMonthPage.tsx`.
- Keep `AppWorkspaceHeader` subnav only where it reduces route confusion. On Stage 1, audit `EasyListLayout.tsx` and `EasyWorkoutLayout.tsx` because "Lists / Email" and "Dashboard / Log / Routines" add app-shaped chrome before the assistant model is clear.

## Optional Modules To Hide Under More

- Hide EasyWorkout under More by default after the core assistant shell is established. Keep fast workout logging reachable at `/app/easyworkout/log`; stop presenting workout as a daily peer beside Today, Inbox, Plan, and Notes. Files: `app-vNext/src/components/navigation/appProducts.ts`, `app-vNext/src/features/easyworkout/layouts/EasyWorkoutLayout.tsx`.
- Hide EasyProjects under More. It is useful for longer arcs but should not appear on the first assistant path. Files/routes: `/app/easyprojects`, `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx`, `app-vNext/src/components/navigation/appProducts.ts`.
- Hide EasyPipeline and EasyContacts under More. They are follow-up/job/people modules, not Stage 1 assistant navigation. Files/routes: `/app/easypipeline/dashboard`, `/app/easycontacts`, `app-vNext/src/components/navigation/appProducts.ts`.
- Hide EasyStatistics under More or remove it from default visible apps. Progress trends are optional depth. Files/routes: `/app/easystatistics`, `app-vNext/src/features/easystatistics/routes/EasyStatisticsPage.tsx`, `app-vNext/src/components/navigation/appProducts.ts`.
- Hide school planning from the HQ first path. Keep the school idea for a later School layer, but move the visible "Semester layer" out of `/app/hq` until there is a real assistant IA for it. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Hide fun/drinks behind an explicit More or hash-only path. Do not let `#fun-drinks` become part of the default assistant story. File: `app-vNext/src/features/hq/routes/CommandCenterPage.tsx`.

## Confusing UI To Delete Or Hide

- Delete or hide the `/app/hq` `PageSection` titled "Useful ideas without crowding today". It says it avoids crowding, but it is still another visible content block before the assistant shape is settled. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Delete or hide the `/app/hq` `PageSection` titled "Semester layer". School is promising, but it currently looks like a new module inside the home screen. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Delete or hide the `/app/hq` `PageSection` titled "Quiet tools under the surface". A module grid on Today still teaches the user that EasyLife is a suite of apps, not one assistant. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Hide the `/app/hq` install card from the daily start route. Keep install help in Settings only. Files: `app-vNext/src/features/hq/routes/HQPage.tsx`, `app-vNext/src/features/settings/routes/SettingsPage.tsx`.
- Replace `/app/hq` "Presentation flow" and `demoPath` with user-facing language or remove it entirely. It is internal staging copy and should not be part of the signed-in product. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Hide `/app/hq` "Deeper daily read" behind a single context disclosure only if it remains useful. Do not add another stats grid to the first assistant route. File: `app-vNext/src/features/hq/routes/HQPage.tsx`.
- Remove "Plan help" from the Daily group in `appProductItems`; if `/app/command` stays, it belongs under Optional/More with a quieter name. File: `app-vNext/src/components/navigation/appProducts.ts`.
- Simplify Settings advanced sections. "Distribution", "Data", "Labs", and broad "Assistant" controls should be advanced/admin-only, not normal setup. File: `app-vNext/src/features/settings/routes/SettingsPage.tsx`.
- Remove builder/distribution copy from normal Settings: "TestFlight later", "Store metadata", "Rollback plan", and "Capacitor iOS and Android projects". Keep only if a separate owner/admin section is explicitly selected. File: `app-vNext/src/features/settings/routes/SettingsPage.tsx`.
- Avoid new feature cards, product grids, or dashboard sections in Stage 1. The next UI tasks should remove or hide the sections above before adding any new assistant visuals.

## Recent HQ Changes To Keep, Revert, Or Replace

- Keep the useful part of `068ccd27 Refine EasyLife HQ command surface`: the natural capture affordance in `HQPage.tsx` is aligned with the assistant model. Replace the visible "Open" tag only if it creates visual noise on mobile; do not revert the idea.
- Keep the theme restraint from `bcbef141 Force calm shell for EasyLife HQ` in `app-vNext/src/styles/globals.css`. Do not treat this as the solution, because color cannot fix the overloaded IA. Future work should avoid another color-only pass.
- Keep the deletion in `f0bad431 Restructure EasyLife HQ command layout` that removed the old "Fast ways to put a thought somewhere safe" capture row from `HQPage.tsx`. That removal was in the right direction.
- Replace the remaining structure preserved by `f0bad431`: renamed sections "Parked", "School", and "Modules" are still visible blocks on Today. The next implementation should hide these sections, not rename them again.
- Replace the current `/app/hq` sequence after the first status strip. Recommended order for Stage 1: first card, compact status strip, one closed context disclosure, then stop. Move anything else to More, Settings, or later stages.

## Next Simplification Targets

- Stage 1 shell task: edit `app-vNext/src/components/navigation/appProducts.ts` and, if needed, `AppHeader.tsx` so the default mental model is Today, Inbox/Capture, Plan, Notes, More. Hide optional modules from first-level daily grouping.
- Stage 1 Today task: edit `app-vNext/src/features/hq/routes/HQPage.tsx` to remove or hide the Parked, School, Modules, install, Presentation flow, and extra stats-grid sections from the default `/app/hq` route.
- Stage 1 Settings task: edit `app-vNext/src/features/settings/routes/SettingsPage.tsx` so everyday Settings shows Personalize, Apps, Calendar, Notifications, and Account first, while Data, Distribution, Assistant, Labs, and app-default internals stay advanced and quiet.

