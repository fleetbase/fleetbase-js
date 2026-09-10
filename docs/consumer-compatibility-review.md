# First-party compatibility and PR #35 review

Reviewed: 2026-09-10. Decision: **hold PR #35 and the v2 release**. The refactor does not currently preserve the behavior required by Navigator and Storefront. Passing SDK coverage and package checks are not application acceptance.

## Reviewed revisions and scope

| Component                | Revision                                               | Context                                                                         |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| SDK release base         | `2d610f2be0d8fa0bc8b82577f4408bfdb644bbac`             | Includes release workflow PR #34; renamed from `dev-v2.0.0` to `release/v2.0.0` |
| SDK PR #35               | `f39513f2a536ced298f40d37e576a35ae728c2fa`             | Reviewed independently in a detached worktree                                   |
| Navigator                | `510f531b5aed1227bd453c1ee5c3b4acb14da0ec`             | Active `src/v3` adapter/provider and shared components                          |
| Storefront               | `4d2c6b3b8b7c3e7de6ceb0d0e1bd5664ba81e5f7`             | SDK hook, saved places, cached collections, driver markers                      |
| Fleet-Ops upstream main  | `2980fb39cd4ff58442d287907849efea3a2805ba`             | Controller response contracts and routes checked against GitHub                 |
| Fleet-Ops latest release | `v0.6.65` / `ddfc6d2a1fb354f057b4355c7af33fb2ee8df4e9` | Inspection driver API not shipped                                               |

Both apps declare `@fleetbase/sdk: ^1.2.13` and have 1.2.13 installed. They will not automatically adopt v2. Both use React Native 0.86.0 and support Node 20, whereas this SDK declares Node >=22.13.0. Adoption must explicitly address that engine boundary. The separately bundled SDK inside the installed Storefront SDK is another dependency boundary; replacing the apps' direct SDK does not replace that embedded copy.

No app manifests, lockfiles, or source were changed. Existing Storefront `ios/Podfile.lock` modifications and Navigator's untracked `legacy/` directory were preserved. No merge, tag, publication, or default-branch change was performed.

## Release-base regressions (also inherited by PR #35)

### P1: GET bypasses Navigator's authentication and error handling

`src/adapters/browser.ts:50-51` calls `requestWithFetch` directly. In 1.2.13, GET goes through the overridable `request()` method. Navigator's actual `src/v3/api/NavigatorAdapter.ts:178` depends on that extension point for dual-token authentication, timeout, API reachability, and unauthorized handling.

Reproduction with the actual Navigator adapter: after `setUserToken('driver-token')`, a GET still sends `Bearer platform`. A GET returning HTTP 401 does not call `onUnauthorized`. Restore dispatch through the compatible extension point for every HTTP verb, including query serialization and options.

### P1: mutations lose their bodies in the existing Navigator subclass

`src/adapters/browser.ts:54-63` passes raw data to `request()`. The legacy adapter passed `{ body: JSON.stringify(data) }`. Navigator still reads `data.body` when sending requests and recording offline mutations (`NavigatorAdapter.ts:186,203`).

The actual login request sends an undefined body; an offline fuel report also queues an undefined body instead of `{ volume: 10 }`. Preserve the legacy override contract and test login, online mutations, offline persistence, and replay against the same packed artifact.

### P1: ordinary JSON containing a `body` property is corrupted

`src/adapters/browser.ts:42-47` treats any object containing `body` as a transport-options envelope. With the refactored `post()` calling it with raw business data, posting `{ body: 'hello', type: 'text' }` sends only the literal `hello`. Navigator chat uses body-bearing payloads (`src/v3/data/useChat.ts`). Separate payload serialization from the legacy request envelope without guessing based on a business property's name.

### P1: API GeoJSON driver locations become zero coordinates

`src/resources.ts:245-247` accepts only `instanceof Point`. API JSON is a plain GeoJSON object. `new Driver({ location: { type: 'Point', coordinates: [106.9, 47.9] } }).coordinates` returns `[0, 0]` instead of `[47.9, 106.9]`; the old SDK returns the latter.

Both apps consume `driver.latitude` and `driver.longitude` in `src/components/DriverMarker.tsx` (Storefront line 104; Navigator line 69). Normalize valid plain GeoJSON while preserving the established getter ordering, and test a driver fetched from a serialized API response rather than only a constructed `Point`.

### P2: configured headers disappear through the subclass extension point

`src/adapters/browser.ts:9-18,21-25` changes the exposed header bag from a spreadable record into `Headers`. Navigator uses `{ ...this.headers, ...this.authHeader() }`. A configured `Accept-Language: mn` disappears on its mutation requests. Preserve the external header contract, even if fetch uses `Headers` internally.

### P2: declaration adoption needs an application check

Navigator's `tsconfig.v3.json:15` points at the old `types/fleetbase.d.ts`, which the v2 tarball no longer ships. Do not claim this alone guarantees compilation failure: package resolution can fall back. With the candidate declaration explicitly mapped in an isolated compiler run, Navigator has one additional diagnostic at `src/v3/navigation/DriverTabs.tsx:551`: `adapter.host` is now `string | null` but the help screen accepts `string | undefined`. The same project has 15 pre-existing CameraCapture/theme diagnostics with its installed SDK. Resolve the intended public nullability contract and remove the obsolete path override during a separately scoped consumer migration.

## PR #35-specific findings

These defects are introduced by PR #35, separately from the base regressions above.

### P1: trailer attach/detach overwrite the trailer with a different response type

[PR #35 resources.ts lines 83-90](https://github.com/fleetbase/fleetbase-js/blob/f39513f2a536ced298f40d37e576a35ae728c2fa/src/resources.ts#L83) passes both responses to `afterFetch`. A resource-bound store installs an after-fetch hook that replaces the resource's attributes (`src/resource.ts:47,251`).

The [upstream TrailerController](https://github.com/fleetbase/fleetops/blob/2980fb39cd4ff58442d287907849efea3a2805ba/server/src/Http/Controllers/Api/v1/TrailerController.php#L239) returns an asset connection from attach, and `{ status: 'ok', connection: ... }` from detach. These are not Trailer representations. Reproductions change `trailer.id` to `asset_connection_1` after attach and to `null` after detach, making subsequent operations address the wrong resource. Return the documented connection/acknowledgement without hydrating the Trailer from it; test both store and instance methods using actual response shapes.

### P1: sending a work order destroys its identity and business status

[PR #35 resources.ts line 165](https://github.com/fleetbase/fleetbase-js/blob/f39513f2a536ced298f40d37e576a35ae728c2fa/src/resources.ts#L165) likewise hydrates from an acknowledgement. The [upstream WorkOrderController](https://github.com/fleetbase/fleetops/blob/2980fb39cd4ff58442d287907849efea3a2805ba/server/src/Http/Controllers/Api/v1/WorkOrderController.php#L105) returns `{ status: 'ok', message: ... }`. Calling `workOrder.send()` changes the resource ID to null and its business status to `ok`. Preserve the WorkOrder and return a correctly typed acknowledgement.

### P2: promised store type exports are missing from the package root

PR #35 lists `ManifestStore`, `ManifestStopStore`, `TrailerStore`, `VehicleStore`, and `WorkOrderStore` as new exports. They are exported from `src/fleetbase.ts`, but not re-exported by `src/index.ts`. Inspection of both packed declaration entry points confirms they are internal declarations, not named exports. Add explicit type re-exports and a consumer test importing them from `@fleetbase/sdk` in both ESM and CJS resolution modes.

### Conditional backend gate: inspections are not released

The [upstream routes](https://github.com/fleetbase/fleetops/blob/2980fb39cd4ff58442d287907849efea3a2805ba/server/src/routes.php) and latest `v0.6.65` do not expose the driver inspection surface. The local Fleet-Ops checkout contains newer implementation, but is not evidence of a shipped API. PR #35 documents this caveat. Keep inspection adoption disabled until a verified backend release exists, or explicitly approve shipping these as unavailable/opt-in methods. This dependency is distinct from the unconditional defects above.

## Test evidence

| Check                                                                       | Installed 1.2.13   | Release base       | PR #35                                                 |
| --------------------------------------------------------------------------- | ------------------ | ------------------ | ------------------------------------------------------ |
| Actual Navigator adapter/provider Jest suites                               | 32 passed          | Not separately run | 19 passed, 13 failed                                   |
| Real Navigator adapter + real `Response` objects, core consumer probes      | 9 passed           | 2 passed, 7 failed | 2 passed, 7 failed                                     |
| Trailer attach/detach and work-order send response probes                   | Not applicable     | Not applicable     | 3 failed                                               |
| Actual Storefront hook, auth/language header propagation and Place creation | Not separately run | Passed             | Not separately run                                     |
| SDK unit coverage                                                           | Not measured here  | Not rerun here     | 30 passed; 100% statements, branches, functions, lines |
| Package validation                                                          | Not rerun here     | Built and packed   | Publint, ATTW, export parity passed                    |

The Navigator Jest comparison changes only SDK resolution, using a temporary external Jest configuration. Some failures reflect its legacy response mocks hitting a newly selected transport. The independent probes use real `Response` objects and establish the functional failures without that ambiguity.

PR #35 coverage is 766/766 statements, 653/653 branches, 384/384 functions, 707/707 lines. Its tests use a recording adapter with generic resource responses and therefore miss the backend acknowledgement/connection distinctions. 100% execution coverage is not a compatibility guarantee.

The reusable [consumer probe](../scripts/review-consumer-compatibility.mjs) loads the real Navigator adapter/queue implementation from a supplied checkout, mocks native persistence in memory, and uses local fetch fixtures. Run with Node 24 and installed Navigator dependencies:

```sh
node scripts/review-consumer-compatibility.mjs /absolute/path/to/extracted/package/dist/index.js /absolute/path/to/navigator-app
```

For a baseline, pass the installed 1.2.13 ESM entry (`dist/esm/fleetbase.js`). Build, pack, and extract each candidate before running; do not reuse stale `dist`. The script exits nonzero on any failed probe. It is an explicit diagnostic tool, not part of SDK-only CI, because it requires a separate consumer checkout. Storefront-pattern probes in this script are not a substitute for the actual hook check or native acceptance.

No iOS/Android binary was built or exercised on a device, and no live production API writes were made. Metro/native runtime compatibility, full offline replay lifecycle, maps, and end-to-end application acceptance remain unverified.

## Release plumbing and branch maintenance

- Renamed remote and local branch to `release/v2.0.0`. GitHub automatically retargeted PR #35 and closed historical source-branch PR #33; use the replacement draft release PR for continued review.
- CI previously filtered pull-request targets to `main` and `master`, so PR #35 had no hosted checks at review time. This maintenance change adds `release/**`. Require a fresh CI run after the PR incorporates the updated base; this is not a claim that the reviewed PR has passed hosted checks.
- The release workflow introduced by PR #34 only tags. There is currently no tag-triggered npm publication workflow in this checkout, while `docs/releasing.md` still describes the earlier publication flow. Restore/reconcile the intended protected publication path before promising automatic npm releases.
- The branch targets 2.0.0, `package.json` is 2.0.0-next.0, and `RELEASE.md` is a 1.2.13 placeholder. The tag workflow deliberately refuses this mismatch. Finalize version, current release notes, and npm dist-tag deliberately; do not tag this snapshot as stable.
- The default branch remains `master`. The previously requested `main` migration remains separate release work; the current tag workflow still targets `master` and needs coordinated migration.

## Required exit criteria

1. Preserve adapter subclass behavior and plain GeoJSON driver coordinates; add regression tests that fail on the reviewed base.
2. Correct PR #35 response handling and public type exports using released backend contracts.
3. Re-run Navigator's existing suites and the diagnostic probes against one freshly packed candidate, with no new SDK-attributable failures.
4. Validate both apps' real type/bundler configuration and complete native acceptance for login, restored sessions, offline mutations/replay, saved addresses, tracking markers, and chat. Track unrelated existing compiler failures separately.
5. Resolve the inspection backend and Node support/adoption decisions; do not silently weaken compatibility requirements.
6. Reconcile release automation, version metadata, notes, publication gates, and the default-branch migration; then require hosted checks on the exact reviewed commits before owner approval.

The only implementation changes accompanying this review are branch-reference documentation, CI release-target coverage, and the diagnostic probe. SDK runtime fixes and consumer changes are intentionally not included in this review-only work.
