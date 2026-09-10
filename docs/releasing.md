# Releasing the Fleetbase SDK

Publication is owner-approved. Do not publish from a developer machine.

## Repository prerequisites

- The default branch is `main`; require CI success and CodeQL before merging a release PR.
- Configure the protected `npm` GitHub environment with required maintainer review and allowed release tags.
- Configure npm trusted publishing for repository `fleetbase/fleetbase-js`, workflow `publish.yml`, and environment `npm`, allowing publish.
- Set repository variable `NPM_PUBLISH_ENABLED=true` only after the protection and trusted-publisher settings are verified. Publication jobs otherwise skip, including manual runs.
- The shared release-tag workflow requires the organization secret `_GITHUB_AUTH_TOKEN`; without it, tagging explicitly warns and skips. It must not fall back to `GITHUB_TOKEN`, whose tag pushes do not trigger the publishing workflow.

The publisher uses Node 24.15 and npm's OIDC support, with no npm access token. See [npm trusted publishing requirements](https://docs.npmjs.com/trusted-publishers/) and [GitHub workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

## Reviewed release flow

1. Prepare `release/v<version>`, matching `package.json`, the first line of `RELEASE.md`, and the correct npm dist-tag. Changesets may assist version preparation, but there is no second automatic version-PR/publish path.
2. Require packed-artifact CI, first-party acceptance, and owner approval before merging into `main`.
3. `release.yml` calls the shared tag workflow, which validates metadata and tags the exact merge commit. Its main-only manual dispatch is a recovery path.
4. The tag push starts `publish.yml`. After the protected environment review, it confirms the tag matches the package version and its commit is reachable from `main`, then reruns full SDK verification.
5. `scripts/publish.mjs` packs once, writes `artifacts/SHA256SUMS`, and publishes that tarball with provenance.
6. `scripts/verify-published.mjs` downloads the registry tarball, verifies its SHA-256 digest, installs from the registry in a clean directory, and executes ESM and CommonJS consumers.
7. GitHub preserves release evidence for 90 days and attaches verified artifacts to the release.

A manual publishing retry must target the existing release tag, not a branch. Tag collisions and version mismatches are refused. If npm already has the version, publication continues only when its tarball checksum matches; it never replaces a published version.

Prereleases use `next`; stable versions use `latest`. Updating review-branch metadata to 2.0.0 does not authorize publication.

## Local validation

```sh
pnpm run verify
node scripts/validate-release.mjs v2.0.0
node scripts/publish.mjs --dry-run
```

The dry run requires an empty ignored `artifacts/` directory and never publishes. A real script invocation refuses to run outside GitHub Actions.

## Failure and rollback

Preserve release evidence if registry verification fails. Fix the release branch before approval; after publication, ship a corrected version rather than moving tags or replacing package bytes. npm deprecation, unpublish, and dist-tag changes require explicit owner action.

Native app acceptance, the shared tag secret, environment protection, and npm trusted-publisher access are external gates: passing local checks does not prove they are configured.
