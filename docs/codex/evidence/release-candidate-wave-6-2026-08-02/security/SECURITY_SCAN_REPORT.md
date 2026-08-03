# Security Review: easylifehq.github.io

## Scope

Whole-repository release-candidate security review of the immutable Wave 5 source tree.

- Scan mode: repository
- Target kind: git_worktree
- Target ID: target_sha256_640ab6bb141059e607da48bb6932d8f4287f7dfb0f1ca4596367e8f249f321ee
- Revision: 222df60f94fb18bbbd556b2ae03efe2978b38087
- Snapshot digest: codex-security-snapshot/v1:sha256:ea6a3160cee02115542259bc810ef29ae1d765c8356899c8c2a92913a6b5022b
- Inventory strategy: repository
- Included paths: .
- Excluded paths: none
- Runtime or test status: Application, Emulator, build, Functions lint, and advisory gates were independently reproduced; no production data or deployment was used.
- Artifacts reviewed: 746 tracked files, Firestore rules and Emulator tests, Firebase Functions, demo adapters, export implementations, PWA and deployment configuration, all package and lockfiles
- Scan context: The threat model was generated during Phase 1. Focus included secrets, demo isolation, Firestore authorization, query trust, exports, PWA cache, and deployment compatibility.

Limitations and exclusions:
- No production environment inspection
- No physical-device or installed-PWA validation
- Archived old-site is reviewed but outside the approved runtime

### Scan Summary

| Field | Value |
| --- | --- |
| Reportable findings | 7 |
| Severity mix | medium: 3, low: 4 |
| Confidence mix | high: 7 |
| Coverage | complete |
| Validation mode | Static source-to-sink analysis plus bounded deterministic local tests and authenticated Firebase Emulator probes. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Public account creation and signed-in user-controlled records are the principal attacker boundaries. Firebase Functions, Firestore ownership, demo isolation, downloaded exports, and the static hosting boundary protect cost, confidentiality, integrity, and release safety.

### Assets

- User-owned EasyLife records
- Firestore storage and authorization
- OpenAI provider quota and secrets
- Downloaded account/workout exports
- PWA application shell

### Trust Boundaries

- Unauthenticated browser to Firebase Auth
- Authenticated user to per-user Firestore namespace
- Client request to cost-bearing Functions
- Synthetic demo context to production Firebase singleton
- User records to spreadsheet/JSON downloads
- Source app to generated hosting artifact

### Attacker Capabilities

- Create an ordinary public account
- Control fields in their own supported records
- Invoke authenticated Functions
- Open crafted deep links and query parameters
- Trigger user-initiated exports

### Security Objectives

- Enforce cross-account isolation and bounded schemas
- Require server-issued authorization for provider work
- Guarantee demo mode makes no production Firebase calls
- Exclude credential-shaped fields and neutralize spreadsheet formulas
- Publish only the current built app and exclude the archive

### Assumptions

- Repository maintainers and merged automation configuration are trusted
- old-site is not an approved deployment surface
- Production provider features remain disabled until explicitly approved

## Findings

| Finding | Severity | Confidence | Detailed write-up |
| --- | --- | --- | --- |
| [Public accounts can invoke paid task-analysis provider work](#finding-1) | medium | high | inline below |
| [Owner wildcard permits unsupported Firestore schemas and nested storage](#finding-2) | medium | high | inline below |
| [Public accounts can invoke paid project-planning provider work](#finding-3) | medium | high | inline below |
| [Assistant provider operator gate is a public static phrase](#finding-4) | low | high | inline below |
| [Workout CSV export does not neutralize spreadsheet formulas](#finding-5) | low | high | inline below |
| [Demo project planning can cross into the production Function](#finding-6) | low | high | inline below |
| [Whole-account export can include common credential-shaped fields](#finding-7) | low | high | inline below |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct evidence supports the finding with no material unresolved blocker. |
| medium | Evidence supports a plausible issue, but material runtime or reachability proof remains. |
| low | Evidence is incomplete and the item is retained only for explicit follow-up. |

<a id="finding-1"></a>

### [1] Public accounts can invoke paid task-analysis provider work

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | A direct static trace shows authentication followed by the paid provider sink with no authorization claim. |
| Category | Missing authorization / uncontrolled resource consumption |
| CWE | CWE-862, CWE-770 |
| Affected lines | app-vNext/src/features/auth/routes/LoginPage.tsx:38-48, functions/index.js:1162-1269 |

#### Summary

The task-analysis Function accepts any valid Firebase ID token from the public signup flow before making a paid OpenAI request; no entitlement, operator claim, App Check, or per-UID quota is enforced.

#### Root Cause

Authentication is treated as authorization for a cost-bearing provider capability even though accounts are publicly creatable.

#### Validation

A direct static trace shows authentication followed by the paid provider sink with no authorization claim. Validation details were not recorded separately.

Validation method: Static authentication-to-provider trace.

#### Dataflow

The canonical finding records the affected path at app-vNext/src/features/auth/routes/LoginPage.tsx:38-48, functions/index.js:1162-1269, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Medium** — Low-skill authenticated abuse can consume paid quota and affect availability, while input limits and provider quotas cap individual requests.

Lower with a server-issued access claim plus per-UID quota or App Check.

#### Remediation

Require a server-issued AI-access or operator custom claim before reading the provider secret or invoking the provider; add authorization regression tests.

Tests:
- Reject ordinary authenticated accounts.
- Allow an account with the explicit server-issued claim.

Preventive controls:
- Separate authentication and capability authorization for all cost-bearing Functions.

<a id="finding-2"></a>

### [2] Owner wildcard permits unsupported Firestore schemas and nested storage

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | Static rules analysis and authenticated Emulator probes directly confirmed owner writes to unsupported nested paths. |
| Category | Improper input validation / resource abuse |
| CWE | CWE-20, CWE-400 |
| Affected lines | firestore.rules:49-50, app-vNext/tests/firebase-emulator.integration.mjs:167-175 |

#### Summary

A public account can write arbitrary top-level and nested collections under its own user namespace because the recursive wildcard enforces ownership but no collection allowlist, depth bound, or schema validation.

#### Root Cause

The recursive wildcard treats user ownership as sufficient authorization for every unknown collection and descendant instead of limiting the supported data model.

#### Validation

Static rules analysis and authenticated Emulator probes directly confirmed owner writes to unsupported nested paths. Validation details were not recorded separately.

Validation method: Static rules analysis plus authenticated Emulator probes.

#### Dataflow

The canonical finding records the affected path at firestore.rules:49-50, app-vNext/tests/firebase-emulator.integration.mjs:167-175, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Medium** — Public signup makes unsupported storage and subscribed-shape corruption deterministic; owner isolation limits confidentiality impact.

Lower if account creation becomes invite-only and independent per-user quotas are enforced.

#### Remediation

Replace the recursive wildcard with an explicit supported-collection allowlist, keep it one document deep, and add bounded schema validation for high-risk records.

Tests:
- Reject unsupported collection names and nested descendants.
- Preserve reads of supported pre-Wave records.

Preventive controls:
- Review Firestore collection inventory whenever adapters add a domain.

<a id="finding-3"></a>

### [3] Public accounts can invoke paid project-planning provider work

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | A direct static trace shows authentication followed by the paid provider sink with no authorization claim. |
| Category | Missing authorization / uncontrolled resource consumption |
| CWE | CWE-862, CWE-770 |
| Affected lines | app-vNext/src/features/auth/routes/LoginPage.tsx:38-48, functions/index.js:1441-1554 |

#### Summary

The project-planning Function accepts any valid Firebase ID token from the public signup flow before making a paid OpenAI request; no entitlement, operator claim, App Check, or per-UID quota is enforced.

#### Root Cause

Authentication is treated as authorization for a cost-bearing provider capability even though accounts are publicly creatable.

#### Validation

A direct static trace shows authentication followed by the paid provider sink with no authorization claim. Validation details were not recorded separately.

Validation method: Static authentication-to-provider trace.

#### Dataflow

The canonical finding records the affected path at app-vNext/src/features/auth/routes/LoginPage.tsx:38-48, functions/index.js:1441-1554, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Medium** — Low-skill authenticated abuse can consume paid quota and affect availability, while input limits and provider quotas cap individual requests.

Lower with a server-issued access claim plus per-UID quota or App Check.

#### Remediation

Require a server-issued AI-access or operator custom claim before reading the provider secret or invoking the provider; add authorization regression tests.

Tests:
- Reject ordinary authenticated accounts.
- Allow an account with the explicit server-issued claim.

Preventive controls:
- Separate authentication and capability authorization for all cost-bearing Functions.

<a id="finding-4"></a>

### [4] Assistant provider operator gate is a public static phrase

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | All gate inputs except ordinary Firebase authentication are client controlled or publicly documented. |
| Category | Missing function-level authorization |
| CWE | CWE-862 |
| Affected lines | functions/index.js:334-337, functions/index.js:956-1060 |

#### Summary

When the environment switch is enabled, any authenticated account can reproduce every client-supplied operator acknowledgement because no server-issued claim or UID policy distinguishes an operator.

#### Root Cause

A static acknowledgement phrase is treated as operator authorization instead of requiring a server-issued identity attribute.

#### Validation

All gate inputs except ordinary Firebase authentication are client controlled or publicly documented. Validation details were not recorded separately.

Validation method: Static authorization and request reproducibility analysis.

#### Dataflow

The canonical finding records the affected path at functions/index.js:334-337, functions/index.js:956-1060, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Low** — The path is deterministic when enabled, but the feature is disabled by default and initially synthetic, reducing practical likelihood.

Higher if provider enablement is broad or the response gains sensitive capabilities.

#### Remediation

Require an explicit operator custom claim in addition to the environment switch and acknowledgement.

Tests:
- Reject an ordinary authenticated account.
- Allow an account with the operator custom claim.

Preventive controls:
- Document custom-claim provisioning and removal in deployment operations.

<a id="finding-5"></a>

### [5] Workout CSV export does not neutralize spreadsheet formulas

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | Direct exporter invocation preserved every tested formula prefix. |
| Category | CSV formula injection |
| CWE | CWE-1236 |
| Affected lines | app-vNext/src/features/easyworkout/domain/workoutHistoryTools.ts:43-52 |

#### Summary

User-authored routine, exercise, and note text is quoted but formula prefixes remain executable when the downloaded CSV is opened in a spreadsheet.

#### Root Cause

CSV quoting protects structure but does not neutralize spreadsheet interpretation of leading =, +, -, or @ after whitespace.

#### Validation

Direct exporter invocation preserved every tested formula prefix. Validation details were not recorded separately.

Validation method: Direct dynamic exporter invocation.

#### Dataflow

The canonical finding records the affected path at app-vNext/src/features/easyworkout/domain/workoutHistoryTools.ts:43-52, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Low** — The consequence is meaningful but requires an explicit user export and downstream spreadsheet open, normally by the same account.

Higher if third-party workout imports are later exported by a different operator.

#### Remediation

Prefix dangerous string cells with an apostrophe after normalizing leading whitespace, and add regression coverage for every supported text column.

Tests:
- Neutralize formula prefixes, including after whitespace.
- Preserve correct CSV escaping.

Preventive controls:
- Use one shared spreadsheet-safe string encoder for future exports.

<a id="finding-6"></a>

### [6] Demo project planning can cross into the production Function

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | The source trace directly connects the demo action, persisted auth singleton, and production network sink without a demo guard. |
| Category | Environment isolation failure |
| CWE | CWE-669 |
| Affected lines | app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:31-37, app-vNext/src/features/easyprojects/lib/projectAiPlanner.ts:73-98 |

#### Summary

Demo context supplies a synthetic user, but the planner helper independently reads the persisted Firebase Auth singleton and targets a hard-coded production Function URL.

#### Root Cause

The route trusts synthetic context identity while its helper bypasses that context and consumes global Firebase authentication.

#### Validation

The source trace directly connects the demo action, persisted auth singleton, and production network sink without a demo guard. Validation details were not recorded separately.

Validation method: Static cross-context control-flow trace.

#### Dataflow

The canonical finding records the affected path at app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:31-37, app-vNext/src/features/easyprojects/lib/projectAiPlanner.ts:73-98, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Low** — A persisted production login on loopback plus an explicit planner action is required, but the path violates the promised zero-production-call demo boundary.

Higher if production authentication is intentionally shared with demo sessions.

#### Remediation

Return before invoking the planner helper whenever demo mode is active, and lock source ordering with a regression test.

Tests:
- Assert the demo early return precedes requestProjectPlan.
- Assert demo fixtures make no Firebase writes.

Preventive controls:
- Pass explicit environment-scoped clients instead of reading global auth in domain helpers.

<a id="finding-7"></a>

### [7] Whole-account export can include common credential-shaped fields

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | Dynamic export tests emitted multiple credential-shaped fields unchanged. |
| Category | Sensitive data exposure |
| CWE | CWE-200 |
| Affected lines | app-vNext/src/features/coreloop/domain/accountExport.ts:48-59 |

#### Summary

The recursive export sanitizer promises credential exclusion but omits common field names such as token, idToken, authorization, clientSecret, session, cookie, privateKey, and serviceAccount.

#### Root Cause

The recursive sanitizer uses a narrow exact-key denylist that does not cover common credential and session names tolerated in legacy record shapes.

#### Validation

Dynamic export tests emitted multiple credential-shaped fields unchanged. Validation details were not recorded separately.

Validation method: Direct export invocation with credential-shaped fields.

#### Dataflow

The canonical finding records the affected path at app-vNext/src/features/coreloop/domain/accountExport.ts:48-59, but no expanded source-to-sink narrative was recorded.

#### Reachability

Reachability was not recorded beyond the canonical finding summary and affected locations.

#### Severity

**Low** — Potential secret inclusion matters, but normal adapters do not write these fields and the export is explicitly user initiated.

Higher if integrations begin persisting opaque credential-bearing objects.

#### Remediation

Expand the case-insensitive denylist and add nested-object regression fixtures for every excluded credential family.

Tests:
- Strip common token, session, cookie, private-key, and service-account names recursively.

Preventive controls:
- Prefer explicit per-domain export projections over generic object traversal.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Firestore rules and per-user data model | Authorization, schema validation, resource abuse | Reported | Owner isolation held, but an unbounded recursive wildcard accepted unsupported paths. |
| Cost-bearing Firebase Functions | Capability authorization and quota abuse | Reported | Project planning and task analysis relied on ordinary authentication only. |
| Assistant provider operator boundary | Function-level authorization | Reported | The default-off operator gate used a public client-supplied acknowledgement. |
| Demo and emulator isolation | Environment isolation | Reported | Project planning could reuse a persisted production Auth singleton from demo mode. |
| Workout CSV and whole-account export | Formula injection and secret exclusion | Reported | Workout CSV lacked formula neutralization; the JSON denylist omitted common credential names. |
| Query parameters, PWA cache, and deep routes | Redirect trust, stale cache, route integrity | No issue found | No attacker-controlled Firebase endpoint redirect or code-execution path survived review; operational stale-root deployment remains a release concern. |
| Overnight local automation | Prompt injection | Rejected | TASK_QUEUE.md is trusted merged developer configuration and repository writers already possess code-execution-equivalent privilege. |
| Archived third-party CDN dependency | Supply-chain integrity | Not applicable | The page is outside the approved runtime and requires CDN compromise; deployment must continue to exclude old-site. |
| Archived EasyNotes and EasyList HTML sinks | Stored XSS | Rejected | Firestore ownership confines writers to the same account, leaving self-XSS in a non-runtime archive rather than a victim boundary. |
| Source, fixtures, bundles, and environment handling | Exposed credentials and production configuration | No issue found | No private key or production credential was found; public Firebase client configuration is not a secret. |

## Open Questions And Follow Up

- Are production AI-access and operator custom claims provisioned through a documented least-privilege process?
  - Follow-up prompt: Review custom-claim provisioning and removal before enabling any provider-backed Function.
