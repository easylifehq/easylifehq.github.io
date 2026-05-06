# AI Assistant Fleet Gates

EasyLife is back in rebuild mode. The fleet should treat the next work as a product reset, not a polish pass.

## Trust Boundary

We can trust the fleet to execute small, specific tasks. We should not trust it with vague taste prompts such as "make it sleek" or "make it beautiful" without hard gates.

## Stage 0 Rules

- Stage 0 is docs-only.
- Do not edit product UI, routes, styles, data, auth, backend, Firebase config, package files, deploy config, generated output, secrets, or old-site files.
- Inspect only EasyLife.
- Write the audit and target IA before seeding Stage 1 UI work.
- Every Stage 0 output must name exact routes/files for the next task.
- Do not launch broad work from Stage 0.

## Stage 1 Rules

- Use BatchSize 1.
- One task owns one surface.
- Each task must remove, hide, or simplify at least one confusing element.
- Do not add dashboard sections, feature-card grids, marketing panels, or visible module sprawl.
- Preserve the useful theme mood, but do not solve the problem with color-only changes.
- Run `npm.cmd run build` from `app-vNext` after product UI changes.
- Commit only clean, buildable work.

## Fail Conditions

A task should be stopped or quarantined if it:

- adds more first-screen boxes without removing complexity;
- treats EasyLife as a suite of separate apps instead of one assistant;
- edits forbidden scopes;
- starts visual polish before Stage 0 audit and IA are complete;
- cannot explain what it made simpler.

## Stage 1 Target Packet

After Stage 0, seed exactly three implementation tasks:

1. Assistant shell simplification.
2. Today first viewport simplification.
3. More/optional module hiding.
