# Default branch migration: `master` to `main`

This is a coordinated release step. Draft PR #36 prepares repository files for `main`, but does not merge itself or publish a package.

## Preconditions

- PR #36 and every required check are green and reviewed; first-party acceptance is complete.
- Branch protection for `main` is configured with the `CI success` and CodeQL checks required.
- The protected `npm` environment exists and permits only reviewed release runs.
- npm trusted publishing is configured for `.github/workflows/publish.yml` and the protected `npm` environment.
- `NPM_PUBLISH_ENABLED` remains disabled until owner-controlled release prerequisites are verified.
- Open pull requests and external automation have been inventoried for hard-coded `master` references.

## Owner procedure

1. Merge the reviewed modernization PR without publishing.
2. Rename the default branch in GitHub from `master` to `main` (or create `main` from the reviewed commit and make it default).
3. Confirm branch protection, rulesets, environments, webhooks, Pages settings, and installed apps target `main`.
4. Update local clones with GitHub's displayed branch-migration commands.
5. Confirm README badges, Codecov, Changesets, Dependabot, CI, and release automation resolve `main`.
6. Keep a temporary compatibility branch or redirect only as long as downstream automation requires it, then remove it in a separately reviewed owner action.
7. Run CI manually on `main`; do not enable publication until the exact candidate artifact and consumer matrix pass.

## Rollback

If repository automation or required consumers fail, restore the previous default branch in GitHub, restore its ruleset, and investigate on a dedicated branch. Default-branch rollback does not require or authorize an npm rollback.
