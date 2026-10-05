# Easy Workout legacy observation import contract v1

Status: isolated first-slice contract; no production persistence or migration is authorized.

The native extractor emits one JSON document matching this shape. All source records remain legacy observations and never become canonical `workoutSessions` in this slice.

```json
{
  "schemaVersion": "easyworkout-legacy-observations-v1",
  "batch": {
    "sourceKey": "synthetic-notebook-a",
    "sourceLabel": "Synthetic training notebook",
    "sourceKind": "handwritten-transcription",
    "unitPolicy": "lb-owner-confirmed",
    "interpretationPolicyVersion": "legacy-evidence-v1"
  },
  "observations": [
    {
      "sourceOrdinal": 1,
      "sourceLocator": "page-001-row-003",
      "sourceHash": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "sourceText": "optional short transcription excerpt",
      "temporal": {
        "precision": "day",
        "label": "Jan 6 2020",
        "date": "2020-01-06"
      },
      "exercise": {
        "sourceName": "Dumbbell row",
        "equipment": "dumbbell",
        "loadConvention": "per-hand",
        "reviewedMapping": {
          "seriesKey": "family-dumbbell-row",
          "seriesLabel": "Dumbbell row",
          "mappingBasis": "owner-reviewed-alias-manifest"
        }
      },
      "sets": [
        {
          "reps": 8,
          "loadLb": 35,
          "evidence": "performed",
          "evidenceBasis": "later-handwritten-policy"
        }
      ]
    }
  ]
}
```

## Closed vocabularies

- `sourceKind`: `handwritten-transcription | generated-plan-export | other`
- `unitPolicy`: exactly `lb-owner-confirmed` for this owner's extraction. Numeric loads are pounds.
- `temporal.precision`: `day | week | month | unknown`
- `exercise.equipment`: `barbell | dumbbell | machine | cable | bodyweight | assisted | other | unknown`
- `exercise.loadConvention`: `per-hand | total | machine-stack | assistance | bodyweight | unknown`
- `set.evidence`: `performed | planned | ambiguous`
- `set.evidenceBasis`: `later-handwritten-policy | explicit-checked | explicit-completed | unchecked-prescription | ambiguous`
- `exercise.reviewedMapping.mappingBasis`, when a mapping exists: exactly `owner-reviewed-alias-manifest`

Temporal variants are strict:

```json
{ "precision": "day", "label": "Jan 6 2020", "date": "2020-01-06" }
{ "precision": "week", "label": "Week of Jan 6 2020", "startDate": "2020-01-06", "endDate": "2020-01-12" }
{ "precision": "week", "label": "Original week tab label" }
{ "precision": "month", "label": "January 2020", "month": "2020-01" }
{ "precision": "unknown", "label": "Undated page 7" }
```

`startDate` and `endDate` are optional for week precision and may appear only when the source states or mechanically implies those bounds. The extractor must not invent a day, week boundary, or month. `sourceOrdinal` is the stable fallback ordering key.

`sourceName` is immutable provenance and is preserved verbatim. Do not trim, case-fold, singularize, or otherwise rewrite it in extracted JSON. The optional `reviewedMapping` is the only mechanism for grouping harmless spelling/plural aliases:

- `seriesKey`: the reviewed stable family identifier, such as the extractor's `family_id` (nonblank, at most 160 characters).
- `seriesLabel`: the reviewed display label, such as `family_label` (nonblank, at most 160 characters).
- `mappingBasis`: exactly `owner-reviewed-alias-manifest`.

Omit `reviewedMapping` unless the alias manifest has been explicitly reviewed. A mapping never overrides equipment or load convention separation.

## Evidence policy

- Later handwritten reps/load are `performed` with `later-handwritten-policy`.
- Early generated prescriptions are `performed` only when explicitly checked or explicitly marked complete.
- Unchecked generated prescriptions are `planned`; unclear marks are `ambiguous`.
- Only `performed` sets enter trend series. Planned and ambiguous sets remain visible in preview counts and warnings.

## Comparison policy

- Without `reviewedMapping`, a comparable series requires the exact verbatim `sourceName`, equipment, and load convention.
- With `reviewedMapping`, matching `seriesKey` values may bridge reviewed aliases, but equipment and load convention must still match exactly.
- Known-different equipment or conventions never merge.
- If equipment or convention is `unknown`, observations may form a source-specific series only when batch `sourceKey`, the exact literal name or reviewed `seriesKey`, equipment, and load convention match. The UI must label weighted data `Recorded load` and state that equipment/load convention is unknown.
- Unknown series never produce PRs, estimated maxes, normalized strength, target overlays, progression rates, or automatic promotion.
- Date precision is displayed as supplied. Trend order uses explicit temporal buckets when comparable and otherwise `sourceOrdinal`; it never fabricates elapsed time.

## Validation and limits

Reject the document when schema/policy values are unsupported, required strings are blank, ordinals are duplicated or are not positive safe integers, dates/months are invalid, hashes do not match `sha256:<64 lowercase hex>`, reps are not positive integers, non-null loads are negative/non-finite, or an observation/set limit is exceeded. V1 limits are 5,000 observations, 50 sets per observation, 160 characters per label/name/locator/mapping field, 500 characters for optional `sourceText`, and at most 100 returned validation errors (`truncated: true` when more exist).

**Durable import limit.** The read-only parser's 5,000-observation limit is unchanged, but saving to an account (durable import) accepts at most **450 observations per v1 batch**. Firestore allows 500 writes per transaction; one confirm or rollback transaction commits observations + batch + confirmation receipt + rollback slot (each read document is written or verified), so 450 + 3 = 453 leaves 47 mutations of headroom. Files with 451 or more observations are rejected locally (`durable-observation-limit`) before any Firestore read or write, with the same limit in persistence shapes, Firestore rules and UI copy. V1 has no chunking; split larger sources into files with different source keys.

`loadLb` is required for non-bodyweight sets. When equipment or load convention is `bodyweight`, `loadLb` may be omitted or explicitly `null`; the extractor must not fabricate `0`. A finite nonnegative numeric value remains valid when the source explicitly records added load.

An empty `sets` array is valid source evidence, is excluded from trends, and produces an `empty-sets` warning. Duplicate hashes warn but retain distinct ordinals. Unknown fields outside temporal objects are dropped with path-bearing warnings; temporal variants reject extra fields so their precision cannot be blurred. Invalid JSON returns a coded `json-syntax` error.

Preview returns validity, errors/warnings, counts by temporal precision and evidence, exclusions from trends, and comparable-series summaries. It performs no writes.
