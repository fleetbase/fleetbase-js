# Consumer compatibility remediation

Updated: 2026-09-10.

## Delivered

- Release base fix: `fd4524fbd80192b2495e7b640574fa4cdebf6210`, draft PR #36.
- Driver-store fix: `432322d` on PR #35, incorporating the base fixes without merging either PR.
- Restored adapter subclass dispatch, token/header overrides, serialized mutation bodies, JSON body-field handling, and driver GeoJSON coordinates.
- Preserved the old declaration path and corrected BrowserAdapter host nullability.
- Corrected trailer attach/detach and work-order send response types and identity preservation; exported public store types.
- Deferred the unshipped inspection APIs from PR #35. No published v1 API was removed.
- Added Node 20.19.4 packed runtime checks separately from modern build tools; TypeScript 5.0.4 and 6.0.2 consumers cover ESM/CJS resolution.
- Restored gated tag-triggered npm publication, release validation, provenance, and registry checksum checks. Version metadata is aligned to 2.0.0; dry-run publication passed.
- Made `main` the default, preserving its existing protection rule and retaining `master`. PR #36 targets `main`.

## Verified evidence

| Check                                                                         | Result                                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Navigator adapter/provider tests against packed candidate                     | 32/32 passed, previously 13 failures                       |
| Actual Storefront SDK hook against packed candidate                           | Passed                                                     |
| Independent consumer/response probes on packed PR #35 candidate, Node 20.19.4 | 12/12 passed                                               |
| Base SDK tests                                                                | 27 passed; 100% statements/branches/functions/lines        |
| PR #35 SDK tests                                                              | 34 passed; 100% statements/branches/functions/lines        |
| PR #35 packed package                                                         | Publint/ATTW passed; 13 files; 97 matching ESM/CJS exports |
| TypeScript 5.0.4 root store/response exports, CJS, and legacy entry           | Node16/NodeNext/bundler passed                             |
| Hosted PR #35 checks at `432322d`                                             | All 41 passed or skipped; none pending/failing             |
| Hosted PR #36 base-fix checks at `fd4524f`                                    | Passed                                                     |
| Workflow syntax and version validation                                        | Passed                                                     |
| Publication                                                                   | Dry run only; nothing published                            |

Navigator's compiler has 15 pre-existing camera/theme diagnostics with the installed SDK; the fixed base returns to that baseline. Neither application's source or lockfiles were changed. Existing Storefront Podfile.lock edits and Navigator's untracked legacy directory remain intact.

## Remaining release gates

- Native iOS/Android device acceptance for real login, restored sessions, offline replay, tracking, and chat. Bundling alone does not validate native runtime behavior.
- One approving review already protects `main`; required CI status checks still need owner configuration.
- The protected `npm` environment, npm trusted publisher for `publish.yml`, and explicit `NPM_PUBLISH_ENABLED=true` setting must be configured before publication can run. Verify the shared tag secret as well.
- Review PR #35 before including the driver-store additions in the v2 release. Approve draft PR #36 only after acceptance; neither PR was merged.

See [the original review and detailed regressions](consumer-compatibility-review.md) and [release instructions](releasing.md).
