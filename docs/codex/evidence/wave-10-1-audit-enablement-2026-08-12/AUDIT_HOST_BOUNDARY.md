# EasyLife Wave 10.1 audit-host boundary evidence — 2026-08-12

## Scope

- Repository: `easylifehq/easylifehq.github.io`
- Branch: `codex/easylife-drinks-games-wave-10-20260808`
- Starting head: `7414332dc63d91c111875adbc14f0d712bc885da`
- Audit-enablement source: `413aa44f6eac8d6a20e4431b91d05550cfc71186`
- Intended isolated Pages project: `easylife-wave10-1-audit`
- Production `main` baseline: `20eb30c0bb245cd59b68a7ebe70cf696533c84b4`

This change only enables a synthetic browser-audit environment. It does not change EasyLife fixtures, feature behavior, data contracts, Firebase rules, production authentication, DNS, or deployment configuration.

## Confirmed blocked state

Before the change, the committed production bundle at `7414332dc63d91c111875adbc14f0d712bc885da` was served unchanged and checked in a browser:

- `http://127.0.0.1:4193/app/hq?demo=1&visualQa=1` opened the synthetic Today surface.
- `http://localtest.me:4193/app/hq?demo=1&visualQa=1` redirected to `/login` and showed the production authentication boundary.

The root cause was a production-only loopback check in `AuthContext`. No public hostname could activate synthetic review mode, so no public black-box audit URL existed.

## Central boundary

`app-vNext/src/lib/runtime/reviewRuntime.ts` is the single hostname classifier shared by authentication and Firebase runtime selection.

Recognized as audit-only:

- `easylife-wave10-1-audit.pages.dev`
- one valid DNS label followed by `.easylife-wave10-1-audit.pages.dev`, matching Cloudflare's deployment and branch preview hostname shape
- ASCII case variants, normalized to lowercase before exact comparison

Rejected:

- `easylifehq.com`, `www.easylifehq.com`, and `easylifehq.github.io`
- arbitrary `pages.dev` projects
- substring and suffix lookalikes
- nested labels before the exact project hostname
- trailing-dot inputs
- invalid, non-ASCII, whitespace-padded, underscore, leading-hyphen, and trailing-hyphen labels
- query-only activation on any unapproved public hostname

Audit mode is selected from `window.location.hostname` and cannot be activated by a fragment, cookie, `localStorage`, `sessionStorage`, or client-controlled runtime override.

## Fail-closed behavior

- The audit-host decision is automatic for the whole page session and does not depend on a query parameter.
- Firebase runtime selection checks the audit boundary before any configured-project or explicit-emulator choice.
- On an audit host, configured Firebase is never passed to `initializeApp`; Auth and Firestore use fail-closed unavailable-service proxies.
- The synthetic Auth state is installed before the unconfigured-Firebase path, preserving existing demo fixtures without production authentication.
- `/login`, public marketing paths, and unknown non-app paths redirect to `/app/hq` with query and fragment removed.
- Existing `/app` and `/settings` navigation stays on the same recognized origin. The service worker remains same-origin and contains no hostname or review-query override.
- Existing EasyDrinks, EasyGames, and Settings demo branches return before production subscriptions or writes.
- A small `Synthetic audit preview · local demo data only` label appears only in audit mode.

All other public hosts retain the existing production authentication and configured-Firebase behavior.

## Automated results

| Gate | Result |
| --- | --- |
| Focused audit/Firebase tests | PASS — 14 passed, 0 failed |
| Complete application suite | PASS — 92 passed, 0 failed |
| TypeScript | PASS |
| Production build | PASS — Vite 5.4.21, 244 modules |
| Functions syntax lint | PASS |
| Publication contract tests | PASS — 29 passed, 0 failed, 1 Windows symlink privilege skip |
| Diff whitespace check | PASS |

Focused coverage includes exact and preview hostname acceptance; malicious, nested, arbitrary-project, production, and malformed hostname rejection; loopback preservation; query/fragment/storage non-activation; audit precedence over an explicit emulator; configured-Firebase initialization denial; login containment; same-origin service-worker navigation; and demo mutation short-circuits.

## Environment-constrained gates

The current reset sandbox prevented two local infrastructure checks from completing:

- The exact cached Firebase CLI `15.25.1` started the Firestore Emulator, but Java could not create its loopback selector (`Unable to establish loopback connection`) before any integration test ran. The same authenticated rules suite passed 9/9 on the reviewed Wave 10.1 source, and hosted CI must rerun it for this commit.
- The in-app browser security policy blocked local URLs and explicitly prohibited retrying through another browser surface. The pre-change browser reproduction above was completed before that policy interruption. Post-change 1440×900, 390×844, and 320×568 console/network/overflow checks are therefore required against the real isolated Pages URL before the external audit packet may leave HOLD.

No package or rules file changed. Online advisory gates and the complete release script remain required in hosted CI.

## Production isolation statement

This commit creates no Cloudflare project, custom domain, Firebase deployment, GitHub Pages deployment, production write, credential flow, or merge. It changes no dependency or build configuration. Deployment is permitted only after deterministic guarded publication, and only to `easylife-wave10-1-audit` with a staging-only no-index header overlay.
