# Fleetbase JavaScript SDK modernization and v2 release plan

Status: proposed for review

Target branch: `dev-v2.0.0`

Prepared: 2026-08-31

## Executive summary

The SDK needs a controlled replacement of its internals, packaging, tests, and release process—not an in-place rewrite with unverifiable compatibility claims. The recommended program is a compatibility-first v2 release: freeze and test the v1 public contract, refactor behind that contract, publish prereleases for real consumer testing, and promote only after every release gate passes.

The v2 designation provides a safe adoption boundary for consumers and room to correct packaging and type-resolution behavior. It is not permission to discard the v1 API. Existing constructors, default and named exports, store/resource methods, adapter extension points, resource names, return shapes, mutation behavior, and error behavior are compatibility requirements unless a change is explicitly documented, deprecated, and approved.

The work should be delivered as small, independently reviewable pull requests on this release branch. A single “big bang” rewrite would make regression diagnosis and API review unreasonably difficult.

## Investigation findings

### Repository and release state

- npm currently publishes `@fleetbase/sdk@1.2.13`; it was published on 2025-02-03. The current npm package has 112 files and includes source, tests, CI configuration, editor configuration, build configuration, declarations, minified bundles, and source maps rather than a deliberate runtime-only allowlist.
- `master` points to v1.2.13. The open `dev-v1.2.14` pull request (#23) adds service quotes and is not included in `master`. The v2 contract inventory must include that API even if #23 is superseded rather than merged.
- Releases are tag-triggered but not lifecycle-managed. Versioning, changelog generation, GitHub Releases, tags, and package publication are not coordinated by one auditable release flow.
- npm and GitHub Packages are rebuilt and published in separate jobs. There is no guarantee they receive the same bytes.
- npm publication uses a long-lived token written into `~/.npmrc`; the workflow does not use npm trusted publishing (OIDC), release provenance, protected environments, or an immutable build artifact.

### CI baseline

- Source lint currently passes, but `pnpm run lint:tests` fails with 42 `no-undef` errors because Mocha globals are not configured.
- The current test run produces 15 passing and 9 failing tests without Fleetbase credentials and a reachable API. All nine failures come from live API CRUD tests. Pull-request correctness therefore depends on secrets, network availability, mutable remote data, and cleanup succeeding.
- No coverage provider, coverage report, or coverage threshold is configured. “100% coverage” is currently neither measured nor enforced.
- The workflow tests only Node 18, which reached end of life in March 2025. As of this plan, Node 22 and 24 are the supported LTS lines; Node 26 is Current.
- pnpm is installed as unpinned `latest`. This plan PR reproduced the resulting breakage in GitHub Actions on 2026-08-31: the selected pnpm required Node 22.13 or newer while the job ran Node 18.20.8, so dependency installation failed before tests. The cache also hashes `package-lock.json` even though the repository uses `pnpm-lock.yaml`, and installs are not explicitly documented as frozen/immutable.
- CI has no concurrency cancellation, minimal permission declarations, dependency review, code scanning, package smoke tests, type tests, bundle-size budget, or cross-platform/consumer matrix.

### Dependency security baseline

- A fresh `pnpm audit` on 2026-08-31 reported 1 critical, 39 high, 27 moderate, and 6 low findings in the lockfile.
- The runtime path includes Axios 1.7.9 and a vulnerable `form-data` version. Reported issues include the critical unsafe multipart-boundary advisory plus high-severity server-side request forgery, credential leakage, denial-of-service, redirect/proxy, and prototype-pollution advisories affecting the installed Axios line.
- Open Dependabot PR #31 proposes Axios 1.15.2, but current audit advisories require Axios 1.16.0 or newer for several findings. It must be re-evaluated rather than merged as a presumed complete security fix.
- High-severity build/test findings also affect the installed Rollup, Babel, glob/minimatch, serialization, and YAML-related dependency paths. Runtime and development findings should be triaged separately, but both must be resolved or explicitly risk-accepted before release.

### Packaging and consumer compatibility

- `package.json` declares `"type": "module"` but points the `require` export and `main` field to `dist/cjs/fleetbase.js`. A CommonJS build in a module-scoped `.js` file is ambiguous/incorrect packaging. A Node 24 smoke test returned an empty object from `require('@fleetbase/sdk')`, while ESM import exposed the expected named/default API. The CommonJS entry must be emitted as `.cjs` (with matching declarations) and tested from the packed tarball.
- Type declarations are present but `package.json` has no `types` field or `types` export condition and there is no root declaration entry matching the package entry point. Consumers therefore cannot reliably resolve them.
- Several declarations are invalid or stale: unresolved `[type]` and `mixed` placeholders, undeclared Axios types, incorrect return types, missing v1 exports/stores, and imports that do not match the implementation.
- Rollup minifies ESM and CommonJS outputs as well as the browser bundle, bundles Axios into every format, and emits roughly 314 KB per JavaScript entry in the audited local build. The packed v1.2.14 candidate was approximately 788 KB compressed and contained 112 files.
- The package has no `files` allowlist, `sideEffects` declaration, `engines`, `packageManager`, export-map type conditions, explicit browser/node entry strategy, or automated package-lint/type-resolution checks.
- `src/resources/vehicle.js` imports `Point` from the published package name instead of a local source module. That self-import can couple a source build to stale `dist` output, create duplicate identities, and obscure circular dependencies.
- Generated `dist` files are committed and a normal rebuild changes all generated bundles/source maps, creating high-noise diffs and a risk that source, package version, tag, and shipped bytes diverge.

### Correctness and maintainability risks found during source review

These are examples that the test program must capture before and during the refactor; they are not an exhaustive defect list.

- `Resource.empty()` assigns `attribues` instead of `attributes`.
- `Resource.save({ onlyDirty: true })` calls `savedirty()` instead of `saveDirty()`.
- Each `Resource` instance assigns `this.changes = {}` while its prototype also defines `changes()`, shadowing the method.
- Async resource flags are reset only on success, so rejected requests can leave `isLoading`, `isSaving`, `isReloading`, or `isDestroying` stuck.
- `Fleetbase.setAdapter()` changes only the SDK property; stores created in the constructor continue using their previous adapters.
- `Store.destroy()` supplies adapter arguments inconsistently and can drop caller options.
- `isLongitude()` rejects valid longitudes between -90 and 90.
- Collection helpers reference `get` and `compare` without importing or defining them; lint suppression hides the problem.
- The registry starts with a misspelled `storse` key.
- The browser adapter assumes every response body is JSON, collapses structured HTTP errors into generic `Error` objects, uses environment globals directly, and attempts to set a browser `User-Agent` header.
- The environment detector classifies React Native as Node, but the Node adapter depends on Axios/Node-oriented behavior. The empty Ember adapter is exported but never automatically selected.
- The public declaration surface and runtime export surface have already drifted. A declaration-only review cannot prove compatibility.

## Goals and non-goals

### Required outcomes

1. Deterministic, secure CI and automatic releases suitable for a public SDK.
2. Enforced 100% statement, branch, function, and line coverage for the maintained source boundary.
3. A complete internal refactor with an executable compatibility contract for v1 consumers.
4. Verified use across supported JavaScript runtimes, module systems, bundlers, frameworks, TypeScript modes, and common package managers.
5. A smaller, intentional package whose contents, types, exports, provenance, and release notes can be inspected before publication.

### Non-goals

- Redesigning the Fleetbase HTTP API.
- Removing v1 runtime APIs merely because they are awkward.
- Treating generated declaration files, coverage exclusions, snapshots, or ignored branches as a substitute for behavioral tests.
- Requiring live production credentials in pull-request CI.
- Publishing automatically from an arbitrary branch, unreviewed commit, or locally generated tag.

## Compatibility contract

Before refactoring, generate and commit a machine-readable v1 contract from both `v1.2.13` and the pending v1.2.14 service-quote work.

The contract must cover:

- Default export and every named export, including class/function identity and whether each is constructible.
- `Fleetbase` constructor arguments, `newInstance`, options/defaults, public properties, store names, adapter selection, `setAdapter`, and `getAdapter`.
- All adapter constructors and HTTP verb signatures, request URL/header/body behavior, error mapping, and custom-adapter extension behavior.
- Store constructors, actions, CRUD/query signatures, option forwarding, collection serialization, callbacks, and return types.
- Resource constructors, public fields/getters/methods, mutation/dirty tracking, flags, serialization, dates, save/reload/destroy behavior, and subclasses.
- Registry/resolver behavior and extension hooks.
- Utility functions/classes and edge-case behavior, including legacy quirks that consumers may rely on.
- ESM default/named imports, CommonJS `require`, documented deep imports if any exist in published consumers, and browser global behavior.
- TypeScript entry points and representative compile-time contracts.

Use API snapshots plus black-box contract tests against packed v1 and v2 tarballs. When a current behavior is a confirmed defect, record it in a compatibility decision log with one of four dispositions: preserve, fix compatibly, deprecate then replace, or approve as breaking. No behavior changes should be hidden inside refactor commits.

## Target architecture

### Source and types

- Migrate implementation modules to strict TypeScript incrementally, starting at leaf utilities/adapters and ending with stores/resources/Fleetbase. Do not change public names while moving files.
- Define explicit generic types for resource attributes, API envelopes, pagination/meta, request options, adapters, stores, actions, and errors. Replace `any`, `[type]`, and `mixed` placeholders at public boundaries.
- Generate declarations from the same source used to generate JavaScript. Add API-report review (for example, API Extractor or an equivalent declaration snapshot) so public type changes are visible in pull requests.
- Separate pure domain behavior from environment-specific transport. Keep the adapter interface stable and inject `fetch`/transport dependencies where needed for deterministic tests.
- Remove source-to-package self-imports and hidden global dependencies. Keep the registry only if compatibility tests prove it is needed; otherwise retain it as a thin compatibility facade over explicit factories.
- Introduce a typed `FleetbaseError` hierarchy while preserving legacy `Error` compatibility (`instanceof Error`, message semantics) and exposing status, code, request ID, and safe response data where available.

### Package outputs

- Publish one ESM entry (`.js` under `type: module`) and one true CommonJS entry (`.cjs`), with matching ESM/CJS declarations (`.d.ts`/`.d.cts`) and a `types` condition first in each export branch.
- Keep `main` and `module` fallbacks only where they improve compatibility with older tooling; make the `exports` map the source of truth.
- Provide an environment-neutral root and explicit adapter subpaths if needed, such as `@fleetbase/sdk/adapters/browser` and `@fleetbase/sdk/adapters/node`. Unknown runtimes must receive a safe default rather than pretending to be Node.
- Prefer standards-based `fetch` for supported Node and browsers if compatibility testing confirms equivalent behavior. If Axios remains, externalize it from browser-neutral bundles and isolate it to the Node adapter entry.
- Emit an optional minified IIFE/UMD browser artifact separately. Do not minify library ESM/CJS. Preserve source maps.
- Add `files` to publish only runtime outputs, declarations, README, license, and changelog. Exclude tests, source (unless intentionally offered for debugging), CI, editor settings, and build configuration.
- Declare `engines`, a pinned `packageManager`, `sideEffects` truthfully, repository/homepage/bugs metadata, and `publishConfig` for the public npm package.
- Enforce package checks with `pnpm pack`, tarball-content assertions, Publint, `@arethetypeswrong/cli`, ESM/CJS runtime smoke tests, type fixtures, and bundle-size budgets.

## Testing strategy and 100% coverage

### Test layers

1. **Pure unit tests:** utilities, collections, resources, registry/resolver, store actions, state flags, serialization, errors, and every branch/failure path.
2. **Transport contract tests:** browser and Node adapters against mock HTTP servers/interceptors. Verify methods, query encoding, headers, bodies, empty/non-JSON responses, aborts, timeouts, network failures, all supported error envelopes, and option forwarding without external credentials.
3. **SDK contract tests:** constructor/defaults, all stores/resources/actions, custom adapters, adapter replacement, and v1 behavior snapshots.
4. **Package tests:** install only the generated tarball into isolated fixtures; test Node ESM and CommonJS, browser bundlers, TypeScript resolution, default/named/subpath imports, tree shaking, and absence of undeclared files/dependencies.
5. **Framework fixtures:** minimal build-and-run fixtures for Vite vanilla, React, Vue, Svelte, Angular, Next.js (client and server), Nuxt, Ember, and React Native/Expo where support is claimed. Fixtures should import the packed tarball, not workspace source.
6. **Optional integration tests:** scheduled or manually dispatched tests against a disposable Fleetbase environment. They validate real API drift but do not replace deterministic PR tests and do not block unrelated contributions on production availability.

Use Vitest with V8 coverage (or an equivalently maintained runner/provider) and enforce 100% for lines, statements, functions, and branches in the maintained source. Coverage exclusions require code-owner review and must be limited to generated files, declarations, and demonstrably unreachable platform shims. Mutation testing on core store/resource/adapter behavior should be added as a scheduled quality signal so a numeric 100% cannot be achieved with weak assertions.

Every regression fix must first add a failing test. The initial coverage PR must include a coverage-gap inventory and may raise thresholds in reviewed increments, but the release branch cannot reach stable v2 until all four metrics are 100% on a clean CI run.

## Compatibility matrix

### Required release-blocking matrix

| Dimension | Required support/gate |
| --- | --- |
| Node | Node 22 and 24 LTS on Linux; smoke tests on macOS and Windows; Node 26 allowed-to-fail until it enters LTS, then promoted |
| Module systems | Native ESM import, dynamic import, and CommonJS require from the packed tarball |
| TypeScript | `node16`, `nodenext`, and `bundler` resolution; strict consumer fixtures; declarations match runtime exports |
| Package managers | npm, pnpm, Yarn Berry, and Bun install/import smoke tests using the same tarball |
| Bundlers | Vite/Rollup, webpack, esbuild, and the bundlers exercised transitively by required framework fixtures |
| Browsers | Current and previous major Chrome, Firefox, Safari, and Edge through browser tests; document the browserslist policy |
| Frameworks | Vite vanilla, React, Vue, Svelte, Angular, Next.js, Nuxt, and Ember minimal production builds |
| Mobile/edge | React Native/Expo and one standards-based edge runtime are release-blocking only after adapter behavior is explicitly supported and documented |

The matrix must distinguish “supported and blocking” from “best effort/canary.” A badge or README claim is permitted only after the corresponding fixture runs in CI.

## CI design

Split workflows by responsibility and use least-privilege permissions, pinned major action versions, dependency caching through `setup-node`, a pinned pnpm version, and frozen lockfile installs.

### `ci.yml` — every pull request and protected-branch push

- Concurrency group with cancellation of superseded runs.
- Fast quality job: formatting check, source/test lint, strict typecheck, API report check, dependency-boundary/static checks.
- Unit/contract job on Node 22 and 24; upload coverage once; enforce all four 100% thresholds.
- Cross-platform smoke job for Linux, macOS, and Windows.
- Build once, create the npm tarball once, upload it as an immutable Actions artifact, and run all package/consumer jobs against that exact tarball.
- Package-quality job: content allowlist, Publint, Are The Types Wrong, ESM/CJS/type tests, export parity, source-map check, license/readme check, bundle-size budget.
- Framework/bundler and package-manager fixture jobs, grouped to control runtime while keeping failures attributable.
- Dependency review for pull requests and CodeQL/security scanning on supported triggers.
- Production-dependency audit as a release blocker, plus a separately reviewed full-toolchain audit; temporary exceptions must name the advisory, exposure, owner, expiry, and remediation issue.
- No Fleetbase production secrets in untrusted pull-request jobs.

### `integration.yml` — scheduled and manual

- Use an isolated Fleetbase tenant/environment and short-lived credentials.
- Create uniquely named records, track IDs, and clean them in `finally` hooks.
- Separate read-only health/API-contract checks from mutation tests.
- Upload sanitized diagnostics; never log keys or sensitive response bodies.
- Alert on API drift, but define an explicit policy for when a drift failure blocks a release.

### `release.yml` — reviewed automation

Use Changesets (or a comparably reviewable release-PR tool) so every user-visible change carries a semver intent and changelog entry. On merges to `master`, automation should maintain a version PR. Merging that reviewed version PR should:

1. Re-run the complete protected CI suite on the exact commit.
2. Build and pack once.
3. Verify version/tag consistency and package contents.
4. Publish to npm through npm trusted publishing (OIDC) from a protected `npm` environment; no long-lived npm token.
5. Publish provenance automatically, create the signed/annotated git tag and GitHub Release, and attach checksums plus the exact tarball or build metadata.
6. Optionally publish the identical tarball to GitHub Packages in a separate authorized step; never rebuild it.
7. Verify the registry version, provenance, ESM/CJS imports, and a minimal API construction smoke test after publication.

Configure prerelease channels: `next` for v2 prereleases and `latest` only for the approved stable promotion. Add a manual emergency path with the same protected gates and an auditable rollback/deprecation procedure; do not allow ad hoc local publishing.

## Delivery phases and acceptance gates

### Phase 0 — establish the release baseline

Deliverables:

- Decide whether to merge PR #23 as v1.2.14 first or supersede it in v2; in either case import its service-quote API into the v1 contract.
- Inventory npm exports, types, bundle contents, README examples, known downstream Fleetbase consumers, and documented deep imports.
- Add architecture decision records for runtime support, transport choice, TypeScript migration, package outputs, release automation, and committed-vs-generated `dist` policy.
- Capture current defects/quirks in a compatibility decision log.

Gate: reviewers approve the contract and support matrix before refactor work starts.

### Phase 1 — deterministic test and CI foundation

Deliverables:

- Replace live-API pull-request tests with deterministic unit/contract tests.
- Configure test globals correctly, frozen installs, current LTS matrix, caching, concurrency, permissions, and artifact upload.
- Upgrade or replace vulnerable runtime and toolchain dependencies; re-run the lockfile audit and document any time-bounded exceptions.
- Add initial package tarball tests and coverage reporting.
- Keep the live suite only as isolated scheduled/manual integration coverage.

Gate: all PR checks are deterministic and green from a clean clone with no Fleetbase secrets.

### Phase 2 — freeze v1 behavior and reach meaningful 100% coverage

Deliverables:

- Black-box contract harness that can execute against packed v1 and v2 candidates.
- Tests for every public API and the defect/failure paths listed in this plan.
- Four-axis 100% coverage enforcement and mutation-testing baseline.

Gate: 100% lines, statements, branches, and functions on maintained source, plus reviewed mutation survivors; no broad ignores.

### Phase 3 — package and type correctness

Deliverables:

- Correct ESM/CJS file extensions, export map, type conditions, generated declarations, package allowlist, metadata, and adapter subpaths.
- Package-lint, type-resolution, tarball, bundle-size, and source-map gates.
- Deprecation-compatible shims for any legacy import form that can be supported safely.

Gate: every package fixture passes against the tarball; runtime/type export parity is exact; package contents and size meet approved budgets.

### Phase 4 — internal TypeScript refactor

Suggested review sequence:

1. Pure utilities and collections.
2. Errors and shared HTTP contracts.
3. Browser/universal and Node adapters.
4. Registry/resolver and extension hooks.
5. Store and store actions.
6. Resource base class and resource subclasses.
7. `Fleetbase` client construction and adapter/store orchestration.
8. Remove compatibility scaffolding that contract evidence proves unnecessary.

Gate after each pull request: v1 contract, 100% coverage, API report, tarball tests, and affected compatibility fixtures remain green. Refactor commits must not mix undocumented behavior changes.

### Phase 5 — framework and package-manager expansion

Deliverables:

- CI fixtures for the required matrix.
- Explicit environment detection/adapter selection rules.
- Framework-specific documentation only where configuration is actually required (SSR boundaries, client-only keys, React Native transport, Ember use, edge limitations).
- Tested installation commands for npm, pnpm, Yarn, and Bun.

Gate: every claimed environment installs and builds from the packed candidate; unsupported environments fail with actionable errors.

### Phase 6 — prerelease validation

Deliverables:

- Publish `2.0.0-alpha`, then `beta`, then release candidates under the `next` dist-tag through the protected release workflow.
- Test at least the known Fleetbase first-party consumers plus representative ESM, CommonJS, TypeScript, browser, SSR, Ember, and mobile consumers.
- Publish migration guidance, compatibility table, deprecations, package-size changes, and rollback instructions.

Gate: no unreviewed contract deltas; no critical/high defects; consumer sign-off recorded; release candidate passes full CI and post-publish verification.

### Phase 7 — stable v2 and maintenance

Deliverables:

- Promote the approved candidate to `latest` without rebuilding different bytes.
- GitHub Release, changelog, provenance, checksums, migration guide, and support policy.
- Dependabot/Renovate grouping policy, monthly dependency maintenance, scheduled integration/mutation tests, and a defined Node/browser support rollover cadence.

Gate: npm provenance and post-publish smoke checks succeed; rollback owner and procedure are available during the release window.

## Pull-request slicing

Use small PRs into `dev-v2.0.0`, each with a changeset only when it changes a published behavior. Suggested slices:

1. CI/test runner foundation.
2. v1 API and package contract snapshots.
3. Deterministic adapter test harness and removal of live PR dependencies.
4. Coverage expansion by module group until 100%.
5. Correct package outputs/export map/types and consumer fixtures.
6. Utilities/collection refactor.
7. Adapter/error refactor.
8. Store/resource refactor.
9. Client/registry refactor.
10. Framework/package-manager fixtures and documentation.
11. Release automation with a dry-run/staging proof.
12. v2 prerelease, first-party validation, and stable-promotion PR.

Every PR description must include: public API effect, compatibility evidence, test/coverage evidence, package artifact diff, risk, and rollback. Generated output must never be accepted without its source change and a reproducibility check.

## Release approval checklist

- [ ] v1.2.13 and v1.2.14 candidate contracts are captured and reviewed.
- [ ] All maintained source is at 100% lines/statements/functions/branches.
- [ ] Mutation-testing results for core modules are reviewed.
- [ ] ESM, CommonJS, and TypeScript consumers pass from the packed tarball.
- [ ] Required runtime/framework/bundler/package-manager matrix is green.
- [ ] Publint and Are The Types Wrong report no release-blocking defects.
- [ ] Package content and size budgets pass; no secrets or internal-only files are present.
- [ ] API report contains no unapproved changes.
- [ ] Full CI passes on the release commit with frozen dependencies.
- [ ] Release workflow dry run proves one immutable artifact is used throughout.
- [ ] npm trusted publishing, protected environment, and provenance are configured.
- [ ] Migration guide, changelog, support policy, deprecations, and rollback steps are published.
- [ ] First-party Fleetbase consumers pass against the release candidate.
- [ ] Post-publish verification and provenance checks pass before `latest` promotion.

## Success measures

- Pull requests require no Fleetbase credentials and have repeatable results.
- Coverage remains at 100% across all four metrics, with reviewed mutation-test quality.
- Runtime and type exports cannot drift without a visible CI failure.
- The same verified tarball is used for all registries and release evidence.
- `require()` and `import` return compatible documented APIs.
- Package contents are intentionally allowlisted and substantially smaller than the current 112-file/1.72 MB unpacked publication baseline.
- All compatibility claims correspond to a maintained CI fixture.
- A release requires review but no local versioning, tagging, changelog editing, credential file creation, or manual npm publish command.

## Primary references

- [Node.js package entry points and conditional exports](https://nodejs.org/api/packages.html)
- [Node.js supported release lines](https://nodejs.org/en/about/previous-releases)
- [TypeScript declaration publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- [TypeScript package export resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [GitHub Actions package publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages)
- [GitHub `setup-node` package-manager caching](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data)
- [Vitest coverage configuration](https://vitest.dev/config/coverage.html)
- [Changesets workflow and commands](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md)
