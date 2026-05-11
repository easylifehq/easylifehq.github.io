# EasyLife Stage 9 Visual Polish Plan

## Mission

Make EasyLife feel like a slick, technical, calm, powerful AI personal assistant instead of a crowded suite of modules.

Stage 9 is polish, not new product scope. Each task must improve one owned surface, remove or simplify one clutter source, pass build, and leave a proof artifact. No task may add backend behavior, auth changes, Firebase rules/config, payments, dependencies, package files, deploy config, generated output, secrets, or new persisted intelligence.

## Product Order Decision

Finish the reviewable assistant shell before building the real assistant brain.

The current product has the right assistant shape, but the human review risk is visual trust: the app must feel calm, slick, technical, and coherent before intelligence is wired into it. Stage 9 therefore stays focused on visible assistant quality. The assistant brain begins only after a visual proof packet says `READY_FOR_HUMAN_VISUAL_REVIEW` or names small visual blockers that can be fixed without changing the core surfaces.

After Stage 9, the next product phase is Stage 10: Assistant Brain Foundation. Stage 10 starts with a narrow approval-first assistant loop:

- parse messy capture text into suggested task, note, plan, reminder, or follow-up intent;
- show suggested actions before anything changes;
- keep the user in control with approve/edit/dismiss;
- write no hidden automation, no email sending, no calendar sync, and no real memory behavior until those contracts are explicitly designed.

## Evidence Base

- `CHECKPOINT_REVIEW.md`: Stages 1-5 are functionally ready for visual polish. Today, Inbox, Plan, Notes, and More render with `?demo=1`.
- `SIMON_DESIGN_REVIEW.md`: The assistant skeleton is right, but old module chrome, product inventory, card/panel heaviness, and review entrance friction keep it from feeling show-ready.
- `ROBIN_COPY_REVIEW.md`: Signed-in core copy mostly reads as one assistant. Public/login shell still introduces EasyLife like product inventory.
- `MAGIC_SCORECARD.md`: The latest copy cleanup moved the core forward, but public/login inventory remains the known blocker.
- `PHASE_STATE.md`: Current phase is polish, with a hard no-more-features lock and a human taste target of sleek, high-tech, calm, powerful, Apple/Linear/Notion-inspired, and much less visually crowded.

## Target Feel

- Slick: confident spacing, controlled contrast, cleaner active states, fewer competing cards.
- Technical: precise labels, compact command surfaces, useful status cues, less decorative noise.
- Calm: fewer visual interrupts, softer hierarchy, lower density where decisions are made.
- Powerful: the app should feel like it knows where attention belongs, even before real AI automation exists.
- Less crowded: remove repeated module labels, nested panels, heavy cards, product inventory, and any first-screen clutter that competes with the next move.

## Stage 9 Rules

- One owned surface per task.
- Every task must remove, hide, or simplify one visual clutter source.
- Every UI task must preserve the existing route and behavior.
- Copy may change only to support the visual assistant model and must not imply real AI automation, email sending, sync, memory model behavior, or backend intelligence.
- Acceptance command for every implementation task: `npm.cmd run build` from `app-vNext`.
- Proof artifacts for every task: `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/MAGIC_SCORECARD.md`, and a route-specific review note when relevant.
- Stop if the task requires backend/auth/payment/Firebase/dependency/package/deploy/generated/secrets work, new persisted data, real model integration, or more than one surface.

## Sequence

1. Public/login assistant entrance
   - Fix the first impression blocker Robin found before judging the app visually.
   - Remove product-inventory navigation and old suite labels from the login/public shell.

2. Signed-in shell chrome
   - Make Today, Inbox, Plan, Notes, and More feel like one quiet assistant frame.
   - Reduce header/menu density and product-list feeling.

3. Today first viewport
   - Make the assistant command surface sharper, calmer, and more technical.
   - Remove extra panel/card weight around the read, next move, command input, and today strip.

4. Inbox intake surface
   - Make the intake and approval queue feel compact and operational.
   - Remove task-app residue and repeated list framing.

5. Plan route polish
   - Polish the first deeper assistant surface after the entrance, shell, Today, and Inbox read clearly.
   - Keep Plan useful, compact, and connected to Today before moving on to Memory.

## Not Stage 9

- New assistant features.
- Real AI/model access.
- New scheduling algorithms.
- New note search/indexing.
- New app modules.
- Deployment.
- Public product launch copy beyond the bounded login/public shell cleanup.

## Done Signal

Stage 9 is ready for human visual review when:

- Build passes.
- Login, Today, Inbox, Plan, Notes, and Settings/More are inspectable with local review mode.
- Robin can say the entrance and signed-in core no longer read as product inventory.
- Simon can say the first screens feel slick, technical, calm, and powerful enough to judge visually.
- `NEXT_5_TASKS.md` has been completed or replaced by a proof packet that says `READY_FOR_HUMAN_VISUAL_REVIEW`.

## Handoff To Stage 10

Do not begin Stage 10 until the Stage 9 proof packet has been created. If the proof packet is ready, create Stage 10 tasks around the smallest useful assistant-brain behavior: intake classification with human approval. Do not start with broad "AI assistant" work, background automation, or integrations.
