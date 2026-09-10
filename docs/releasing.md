# Releasing the Fleetbase SDK

**Merging a `release/v<version>` PR into `main` authorizes and automatically performs the release.** Required PR review and CI are the approval gate; there is no second environment approval, enable flag, or manual publish step.

## One-time npm setup

Configure the trusted publisher for `@fleetbase/sdk` on npm:

- Organization: `fleetbase`
- Repository: `fleetbase-js`
- Workflow filename: `release.yml`
- Environment: leave empty (this workflow does not use a GitHub environment)
- Allow direct `npm publish`

This external npm authorization must exist before the first release merge. It cannot be inferred from repository settings. The workflow uses Node 24.15 with OIDC and provenance, not a long-lived npm token. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Automatic merge-to-release flow

1. Merge an approved `release/v<version>` PR into protected `main`. Legacy `dev-v<version>` branches are also recognized.
2. `release.yml` checks out the PR's exact merge commit, not whichever commit happens to be at main when the runner starts.
3. Confirm the commit belongs to main and the branch, package version, RELEASE.md headline, and npm dist-tag agree.
4. Run full verification, including release-tag regression tests, SDK coverage, build, and package validation.
5. Create an annotated `v<version>` tag at that commit and push it with the repository-scoped `GITHUB_TOKEN`.
6. Continue in the **same job** to pack and publish the SDK to npm with provenance. This does not rely on a second tag-triggered workflow, so GitHub's token-trigger recursion rules cannot silently stop the release. No `_GITHUB_AUTH_TOKEN` is needed.
7. Verify the registry tarball checksum byte-for-byte and test clean ESM/CommonJS installation.
8. Create the GitHub release from RELEASE.md and attach the exact published tarball and SHA256SUMS. Preserve workflow artifacts for 90 days.

There is only one publishing workflow. Ordinary feature PRs, closed-but-unmerged PRs, branch pushes, and manual tag pushes do not publish.

## Versioning and retries

Use `next` for prereleases and `latest` for stable releases. Example: merging `release/v2.0.0` releases tag `v2.0.0`, GitHub release `v2.0.0`, and `@fleetbase/sdk@2.0.0` on npm.

Re-running the failed merge workflow uses the same reviewed commit. Existing tags on that commit are accepted; tags on other commits are never moved. If npm already accepted the version, the publisher continues only if its tarball matches the newly packed artifact byte-for-byte.

The workflow_dispatch recovery path runs **only on main** and requires an explicit version. It releases that dispatch's main commit, subject to the same metadata and verification checks. A recovery commit cannot reuse an existing version/tag pointing elsewhere: rerun the original release or prepare a new version.

Missing npm authorization or a failed validation fails the release visibly; it does not report success after silently skipping publication. A failed npm publication can leave the tag created; use the retry path after correcting authorization. Do not delete/move tags or replace published bytes.

## Local checks

```sh
pnpm run verify
node scripts/validate-release.mjs v2.0.0
node scripts/release-tag.mjs release/v2.0.0 --name-only
node scripts/publish.mjs --dry-run
```

The dry run requires an empty ignored artifacts directory. Tag creation and real registry publication refuse to run outside GitHub Actions. The tag tests use isolated temporary local repositories and never push this repository's refs.

All native acceptance and release review must finish **before merging**, because the merge starts publication automatically.
