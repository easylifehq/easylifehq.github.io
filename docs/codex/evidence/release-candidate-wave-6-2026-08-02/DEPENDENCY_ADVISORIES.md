# Wave 6 dependency advisory evidence

Inventory date: 2026-08-02. No package or lockfile changed in Wave 6. `npm audit fix --force` was never used.

## Active app (`app-vNext`)

| Package | Severity | Relationship | Scope/reachability | History | Disposition |
| --- | --- | --- | --- | --- | --- |
| `vite` | high | direct | development; dev-server request handling, absent from the static production runtime | inherited | Fix offered only by Vite 8 major; breaking and outside the approved dependency boundary |
| `esbuild` | moderate | transitive through Vite | development; likely unreachable in the static production artifact | inherited | Requires the same Vite 8 major path |
| `react-router-dom` | moderate | direct | production navigation dependency; affected redirect behavior is reachable in principle, but all EasyLife destinations are fixed/local and browser probes found no exploit path | inherited | Fixed line is outside the installed major; breaking router migration explicitly deferred |
| `react-router` | moderate | transitive | production; same advisory family as `react-router-dom` | inherited | Same breaking router migration |

Counts: 1 high, 3 moderate, 0 critical. Production critical gate passes.

## Active Functions (`functions`)

Nine moderate nodes: direct `firebase-admin` and `firebase-functions`; transitive `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, and `uuid`.

These are production packages and inherited. The reported chain terminates in the `uuid` buffer API advisory. EasyLife does not call UUID v3/v5/v6 with a caller-supplied output buffer, so the vulnerable operation is likely unreachable. The audit's automatic resolution downgrades `firebase-admin` to 10.3.0 and `firebase-functions` to 4.9.0, both semver-major/breaking for the installed stack. A standalone nested `gaxios` change is not a supported lockfile-level correction. No safe non-breaking fix was applied. Production critical gate passes.

## Quarantined archive (`old-site/easypipeline/functions`)

Counts: 2 critical, 7 high, 15 moderate, 2 low. All are inherited by a package that is explicitly excluded from the active source app and release artifact. They are unreachable unless someone manually runs or deploys the archive.

- Critical: `protobufjs`, `websocket-driver`
- High: `@grpc/grpc-js`, `brace-expansion`, `fast-xml-builder`, `form-data`, `js-yaml`, `lodash`, `path-to-regexp`
- Moderate: `@google-cloud/firestore`, `@google-cloud/storage`, `@protobufjs/utf8`, `body-parser`, `express`, `fast-xml-parser`, `firebase-admin`, `firebase-functions-test`, `gaxios`, `google-gax`, `qs`, `retry-request`, `teeny-request`, `ts-deepmerge`, `uuid`
- Low: `@babel/core`, `@tootallnate/once`

Although many individual transitive fixes are reported, the direct resolution paths include breaking `firebase-admin@14.2.0` and `firebase-functions-test@0.3.3` changes. Updating an undeployed historical copy would add risk without reducing production exposure. The release control is to keep `old-site/` out of every publication artifact.
