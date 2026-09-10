# Releasing the Fleetbase SDK

**Merging a `release/v<version>` PR into `main` authorizes and automatically performs the release.** Required PR review and CI are the approval gate; there is no second environment approval, enable flag, or manual publish step.

## npm authentication

The SDK uses `secrets.NPM_AUTH_TOKEN`, matching the npm publishing credentials used by Fleet-Ops, Storefront, and Ledger. The existing organization secret must be available to `fleetbase-js`, and its npm token must have permission to publish `@fleetbase/sdk`. No separate npm trusted-publisher registration is required.

`actions/setup-node` configures npm's registry authentication, and the publish step supplies the secret through `NODE_AUTH_TOKEN`. The token is not exposed to dependency installation or verification steps. The workflow fails before checkout or tagging if the secret is missing; it never prints the token. Repository-level secret listings do not establish whether an organization secret is available.

The workflow retains `id-token: write` for npm provenance; npm publication is authenticated with `NPM_AUTH_TOKEN`. No GitHub environment or additional release approval is required.

## Automatic merge-to-release flow

1. Merge an approved `release/v<version>` PR into protected `main`. Legacy `dev-v<version>` branches are also recognized.
2. `release.yml` checks out the PR's exact merge commit, not whichever commit happens to be at main when the runner starts.
3. Confirm the commit belongs to main and the branch, package version, RELEASE.md headline, and npm dist-tag agree.
4. Run full verification, including release-tag regression tests, SDK coverage, build, and package validation.
5. Create an annotated `v<version>` tag at that commit and push it with the repository-scoped `GITHUB_TOKEN`.
6. Continue in the **same job** to pack and publish the SDK to npm using `NPM_AUTH_TOKEN`, with provenance. This does not rely on a second tag-triggered workflow, so GitHub's token-trigger recursion rules cannot silently stop the release. Unlike the modules' split tag/publish workflows, no `_GITHUB_AUTH_TOKEN` is needed.
7. Verify the registry tarball checksum byte-for-byte and test clean ESM/CommonJS installation.
8. Create the GitHub release from RELEASE.md and attach the exact published tarball and SHA256SUMS. Preserve workflow artifacts for 90 days.
9. A dependent job downloads that release asset, checks its identity and checksum against npm, and publishes the identical tarball to GitHub Packages. It uses `GITHUB_TOKEN` with `packages: write`, not `NPM_AUTH_TOKEN`, and verifies the downloaded GitHub package byte-for-byte. Nothing is rebuilt.

There is only one publishing workflow. Ordinary feature PRs, closed-but-unmerged PRs, branch pushes, and manual tag pushes do not publish.

## Versioning and retries

Use `next` for prereleases and `latest` for stable releases. Example: merging `release/v2.0.0` releases tag `v2.0.0`, GitHub release `v2.0.0`, and `@fleetbase/sdk@2.0.0` on npm.

Re-running the failed merge workflow uses the same reviewed commit. Existing tags on that commit are accepted; tags on other commits are never moved. If npm already accepted the version, the publisher continues only if its tarball matches the newly packed artifact byte-for-byte.

The normal workflow_dispatch recovery path runs **only on main** and requires an explicit version. It releases that dispatch's main commit, subject to the same metadata and verification checks. A recovery commit cannot reuse an existing version/tag pointing elsewhere: rerun the original release or prepare a new version.

### GitHub Packages-only recovery

Run `Release SDK` manually with the existing version (for example `2.0.0`) and `github_packages_only` enabled. This skips the npm/tag/release job entirely and mirrors the existing release asset. It can run from a reviewed workflow-fix branch to recover a missing mirror before that fix merges; the existing release tag must still belong to main. It cannot rebuild, create a new tag, or republish to npm. Retries accept an existing identical GitHub package but refuse conflicting bytes.

GitHub Packages uses `https://npm.pkg.github.com` and links the package to this repository via the artifact's `repository` field. Its job intentionally disables npm-specific provenance generation; the original npm provenance and release checksums remain intact. Package access/visibility is managed by GitHub independently of npm. See [GitHub's npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

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
