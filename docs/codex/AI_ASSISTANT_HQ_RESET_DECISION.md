# AI Assistant HQ Reset Decision

## Scope

Reviewed the recent HQ commits and the current protected HQ files without editing product UI:

- `068ccd27` - `Refine EasyLife HQ command surface`
- `bcbef141` - `Force calm shell for EasyLife HQ`
- `f0bad431` - `Restructure EasyLife HQ command layout`
- Current `app-vNext/src/features/hq/routes/HQPage.tsx`
- Current `app-vNext/src/styles/globals.css`
- Current protected shell files `app-vNext/src/components/navigation/appProducts.ts` and `app-vNext/src/components/navigation/AppHeader.tsx`

This is a docs-only reset decision. No `git revert`, build, product UI, auth, backend, payment, package, dependency, release, generated output, credential, or unrelated files were touched.

## Decision Summary

The recent HQ work should not be reverted wholesale. It contains useful assistant-first pieces: Today as the start route, a concrete next move, capture, a compact status strip, calmer shell treatment, and removal of an old capture row. The problem is that the current route still preserves too much dashboard structure below that top surface.

Recommended direction: replace the remaining HQ structure after the first status strip. Keep the first assistant surface, keep the calm shell as background support, and remove or hide the visible blocks that make Today feel like a module showroom.

Do not solve this by another color or theme pass. The reset problem is information architecture and first-screen hierarchy.

## Commit Decisions

| Commit | Change Reviewed | Decision | Reason |
| --- | --- | --- | --- |
| `068ccd27` | Added a small visible `Open` affordance to the natural capture button and added a broad HQ-specific visual refinement block in `globals.css`. | Keep the capture idea; replace the styling as needed. | The natural capture control supports the assistant model because it gives the user one low-friction place to start. The large CSS polish improves calm but does not fix the structural overload, so future work should keep only the pieces needed by the simplified HQ surface. |
| `bcbef141` | Forced a calmer EasyHQ shell through route-scoped theme variables and lighter sidebar/suite-control treatment. | Keep, but treat as supporting only. | The calmer shell helps reduce product-suite noise around Today. It should stay unless it conflicts with the simplified layout, but it is not the reset itself. A color/theme-only follow-up would fail the actual user pain. |
| `f0bad431` | Removed the old visible "Fast ways to put a thought somewhere safe" capture row, renamed lower sections, and added a larger grid-based HQ layout in CSS. | Keep the deletion; replace the preserved lower structure. | Removing the extra capture row was the right simplification. Renaming lower blocks to "Parked", "School", and "Modules" did not solve the core issue because those blocks still appear on Today and still teach the user to browse features. |

## Current HQ State

Keep these current pieces:

- The route starts with `Choose today's next move.`
- The assistant read and `Start here` block choose one next action from real task/calendar state.
- The natural capture button opens the global capture flow.
- The compact status strip gives no more than three immediate signals: calendar, task, and capacity.
- The shell navigation now points toward `Today`, `Capture`, `Plan`, `Notes`, and `More`.

Replace or hide these current pieces from the default `/app/hq` path:

- `Attention` section, unless it becomes the single closed context disclosure under the first card.
- `Parked` / `Useful ideas without crowding today`.
- `School` / `Semester layer`.
- `Modules` / `Quiet tools under the surface`.
- The install card, which belongs in Settings.
- `Deeper daily read` stats grid unless it remains behind one quiet disclosure.
- `Presentation flow` and `demoPath`, because that is staging language rather than user-facing product flow.

## Reset Decision

Use a replace-not-revert move for HQ.

The simplest safe first implementation move is:

1. Edit only `app-vNext/src/features/hq/routes/HQPage.tsx`.
2. Keep the top `assistant-home` surface through the `hq-status-strip`.
3. Remove or hide the default-rendered sections after the status strip: `Attention`, `Parked`, `School`, `Modules`, and the install card.
4. Keep at most one closed context disclosure for deeper daily details.
5. Leave styling largely alone unless a removed section leaves dead selectors for a later cleanup task.

This is safer than a full revert because it preserves the useful assistant-first work while deleting the part that still causes the user pain. It is simpler than another redesign because it removes visible competing structure before trying to invent a better one.

## Implementation Guardrail For The Next UI Pass

The next HQ UI pass should stop when `/app/hq` reads as:

- one short today read
- one recommended next move
- one capture affordance
- no more than three compact context signals
- one quiet way to open deeper context

It should not add new sections, dashboard cards, module grids, school previews, install prompts, presentation/demo copy, or theme-only polish.

## Proof

No product files were edited for this decision. The expected diff for this task is docs-only under `docs/codex/`.
