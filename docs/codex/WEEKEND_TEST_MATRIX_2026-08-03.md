# Weekend Test Matrix

STATUS: AUTOMATED_AND_BROWSER_PASS_WITH_RELEASE_HOLDS

## Automated gates

| Gate | Result | Receipt |
|---|---|---|
| Clean install | PASS | `npm.cmd ci`; 157 packages installed. |
| Workout tests | PASS | 19/19 Node tests, 0 failures. |
| TypeScript + production build | PASS | `npm.cmd run build`; 189 modules transformed. |
| Firebase functions syntax lint | PASS | `npm.cmd run lint` in `functions`. |
| Whitespace | PASS | `git diff --check`. |
| Dependency audit | HOLD | 10 advisories: 1 low, 4 moderate, 3 high, 2 critical. No automatic or major-version fix applied. |
| App lint | NOT AVAILABLE | No application lint script exists. |

## Browser route matrix

Each route was opened from the production Vite preview at both 1440 x 900 and 390 x 844. PASS means the route produced readable content in a `main` landmark and no document-level horizontal overflow. Redirect destinations were also observed.

| Route | Desktop | Phone | Notes |
|---|---:|---:|---|
| `/` | PASS | PASS | Public home |
| `/easylist` | PASS | PASS | Public Inbox |
| `/easynotes` | PASS | PASS | Public Notes |
| `/easycalendar` | PASS | PASS | Public Calendar |
| `/easypipeline` | PASS | PASS | Public Follow-ups |
| `/easyhq` | PASS | PASS | Public Today |
| `/easyprojects` | PASS | PASS | Public Projects |
| `/easycontacts` | PASS | PASS | Public People |
| `/easyworkout` | PASS | PASS | Public Workout |
| `/easystatistics` | PASS | PASS | Public Progress |
| `/login` | PASS | PASS | Authentication |
| `/app` | PASS | PASS | Last-used redirect; query-string crash repaired |
| `/app/hq` | PASS | PASS | Today |
| `/app/plan` | PASS | PASS | Plan landing |
| `/app/people` | PASS | PASS | Redirects to People |
| `/app/workout` | PASS | PASS | Workout landing |
| `/app/command` | PASS | PASS | Capture review |
| `/app/easylist/dashboard` | PASS | PASS | Inbox dashboard |
| `/app/easylist/add` | PASS | PASS | Capture/add |
| `/app/easylist/email` | PASS | PASS | Email intake |
| `/app/easylist/archive` | PASS | PASS | Archive |
| `/app/easylist/deleted` | PASS | PASS | Deleted |
| `/app/easycalendar/day` | PASS | PASS | Day plan |
| `/app/easycalendar/month` | PASS | PASS | Month plan |
| `/app/easynotes` | PASS | PASS | Notes library |
| `/app/easynotes/new` | PASS | PASS | Safe demo redirect to library |
| `/app/easynotes/trash` | PASS | PASS | Trash |
| `/app/easypipeline/dashboard` | PASS | PASS | Follow-up dashboard |
| `/app/easypipeline/stats` | PASS | PASS | Pipeline statistics |
| `/app/easypipeline/email` | PASS | PASS | Pipeline email |
| `/app/easycontacts` | PASS | PASS | People |
| `/app/easyprojects` | PASS | PASS | Projects |
| `/app/easyworkout/dashboard` | PASS | PASS | Calm launch/resume surface |
| `/app/easyworkout/routines` | PASS | PASS | Routine management |
| `/app/easyworkout/log` | PASS | PASS | Full and active modes |
| `/app/easyworkout/exercise/demo-bench` | PASS | PASS | High-data exercise detail |
| `/app/easyworkout/exercise/does-not-exist` | PASS | PASS | Low-data state |
| `/app/easystatistics?tab=workout` | PASS | PASS | Provider crash repaired |
| `/app/settings` | PASS | PASS | Includes workout unit setting |
| `/app/not-found` | PASS | PASS | Safe not-found |

## Workout risk matrix

| Scenario | Result | Evidence |
|---|---|---|
| Legacy draft migration | PASS | Preserves routine, active exercise, notes, elapsed time, and sets. |
| Malformed/old draft | PASS | Readable recovery; no crash. |
| Frequent autosave | PASS | 250 ms local persistence plus page-hide/visibility flush. |
| Route change/interruption | PASS | Exact draft restored in browser. |
| Rapid/retried save | PASS | Shared idempotent operation; deterministic Firestore document ID. |
| Save failure | PASS | Draft retained and operation remains retryable. |
| Offline final save | PASS | Explicit retained state; no navigation or false success. |
| Blank weighted input | PASS | Zero load excluded from records after browser-discovered repair. |
| Empty/malformed history | PASS | No `NaN`, infinity, or false percentages. |
| Mixed set/exercise types | PASS | Incompatible workload/e1RM excluded. |
| Demo writes | PASS | Synthetic demo mode uses memory/session storage only, not Firebase. |
| Accessibility alternative | PASS | Exact record cards and a text/table trend history accompany numeric evidence. |
| Physical phone/PWA | PENDING | Requires real device and installed-service-worker exercise. |
