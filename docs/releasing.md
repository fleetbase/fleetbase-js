# Releasing the Fleetbase SDK

Releases are owner-operated through `.github/workflows/release.yml`. Do not run a real registry publish from a developer machine.

## Repository prerequisites

- The default branch is `main` and its required CI and CodeQL checks are green.
- The protected `npm` GitHub environment requires maintainer review.
- npm trusted publishing authorizes `fleetbase/fleetbase-js`, workflow `release.yml`, branch `main`, and environment `npm`.
- GitHub Actions is allowed to create release pull requests.

The workflow grants write permissions only to the job that needs them. Version pull requests receive repository and pull-request write access without an npm identity token. The publish job receives the npm identity token only after the protected environment gate.

## Automated flow

1. Changesets selects one of three modes: create/update a version pull request, publish an already reviewed version, or do nothing.
2. The publish job reruns the complete repository verification suite.
3. `scripts/publish.mjs` packs once, writes `artifacts/SHA256SUMS`, and publishes that exact tarball with npm provenance.
4. `scripts/verify-published.mjs` waits for registry propagation, downloads the registry tarball, compares its SHA-256 digest byte-for-byte, installs from the clean registry, and executes both ESM and CommonJS consumers.
5. GitHub retains the tarball and checksum as workflow evidence for 90 days and attaches them to the `v<version>` release.

If a publish job must be rerun after npm accepted the package, it continues only when the registry tarball is byte-identical to the newly packed artifact. It refuses to proceed when an existing version has different bytes.

Prerelease versions such as `2.0.0-next.0` use the npm `next` dist-tag. Stable versions use `latest`.

## Local validation

Run the complete package gate, followed by the non-publishing release dry run:

```sh
pnpm run verify
node scripts/publish.mjs --dry-run
```

Delete the generated ignored `artifacts/` directory after inspection. A real invocation of `scripts/publish.mjs` refuses to run outside GitHub Actions.

## Failure and rollback

- Before npm accepts the tarball, fix the release branch or release pull request and rerun the workflow.
- If post-publish registry verification fails, preserve the workflow artifacts and investigate before changing dist-tags.
- Never overwrite or silently replace a published version. Release a corrected version and deprecate the defective version when appropriate.
- npm unpublish and dist-tag changes are explicit owner actions outside this workflow.
