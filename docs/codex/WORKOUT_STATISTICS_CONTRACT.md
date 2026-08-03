# Workout Statistics Contract

STATUS: IMPLEMENTED_AND_EXECUTABLE

Formula version: `easyworkout-stats-v1`. Estimated one-repetition maximum version: `epley-v1`.

## Source and identity

- A completed workout session is the source record. Every record and observation retains its exact source workout ID and local `performedOn` date.
- Exercises are grouped by stable exercise ID. Name normalization is a fallback only when an older record has no ID; same-name exercises with different IDs remain separate.
- Weight display is user-selectable as `lb` or `kg`. Conversion uses `1 kg = 2.2046226218 lb`; calculations do not round intermediate values.
- Calendar windows use inclusive local date keys, not UTC instants. A 28-day current window ending on August 1 is July 5-August 1; the matched prior window is June 7-July 4.

## Working-set inclusion

A set is included only when it is not deleted, is not explicitly incomplete, and is not a warm-up.

| Exercise type | Required evidence | Workload |
|---|---|---|
| Weighted | reps > 0 and weight > 0 | weight x reps |
| Assisted | reps > 0 and a nonnegative assistance value | excluded from weighted workload |
| Bodyweight | reps > 0 | excluded from weighted workload |
| Duration | durationSeconds > 0 | excluded from weighted workload |
| Distance | distanceMeters > 0 | excluded from weighted workload |

Drop and failure sets are compatible working sets when their underlying evidence is valid. A blank weighted input normalized to zero is not a working set and cannot create a zero-weight record. Malformed, `NaN`, infinite, negative, deleted, warm-up, and incomplete values never increase totals.

## Metrics

- Sessions: completed session count in the window.
- Duration: sum of nonnegative `durationMinutes`.
- Working sets: count using the inclusion rules above.
- Weighted workload: sum of `weight x reps` for compatible weighted working sets.
- Percent delta: `(current - prior) / prior x 100`, emitted only when both windows contain samples and the prior value is positive. Otherwise the UI says no comparable prior value.
- Weekly consistency: completed session counts by local Sunday-start calendar week. It is not plan adherence.
- Muscle exposure: each compatible direct working set counts 1.0 and each secondary mapping counts 0.5. Unmapped working sets are reported separately. This is an estimate, not recovery or guaranteed growth.

## Estimated 1RM and records

- Epley: `weight x (1 + reps / 30)`; a one-rep set returns the logged weight.
- 1-10 reps: high formula confidence.
- 11-15 reps: low formula confidence.
- Above 15 reps, zero/negative loads, and incompatible exercise types: no estimated 1RM.
- Exercise records include heaviest weight, most reps, best set workload, best session workload, rep-specific best load, and best estimated 1RM. Each winner retains the exact source workout/date and previous compatible value when available.

## Trend confidence and recommendations

- Fewer than 4 comparable estimated-1RM observations: insufficient.
- 4-5: low; 6-7: medium; 8 or more: high.
- The median of the earlier half is compared with the median of the recent half. Change within +/-2.5% is a plateau; above is improving; below is declining.
- UI output is deterministic rule-based interpretation, never described as AI. It shows one canonical next observation, the rule ID, confidence, formula version, and source workout link.
- The product never infers fatigue, readiness, recovery, injury risk, or medical meaning from time elapsed or workload alone.

## Determinism and edge handling

Ordering ties resolve by value, performed date, and stable workout ID. The executable suite covers empty history, zero denominators, missing IDs, mixed units, DST-boundary fixture dates, missed weeks, deloads, return weeks, plateaus, improving trends, warm-ups, drop sets, deleted/incomplete sets, malformed numbers, and a 2,000-session deterministic history. No metric may emit `NaN` or infinity.
