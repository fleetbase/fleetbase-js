> v2.0.0 ~ "Modern JavaScript packaging and first-party compatibility"

## Highlights

- Strict TypeScript implementation with native ESM, CommonJS, browser bundles, source maps, and public declarations.
- Preserved adapter extension points, authentication/header overrides, mutation bodies, and driver GeoJSON coordinates used by Navigator and Storefront.
- Deterministic contract tests with enforced 100% statement, branch, function, and line coverage, plus packed-artifact framework and package-manager checks.
- Structured API errors, consistent resource state cleanup, and corrected collection and persistence helpers.
- Automatic tagging, npm publication, and GitHub releases after a reviewed release-branch merge, with provenance, checksum verification, and post-publication ESM/CommonJS checks.

## Compatibility

Node 20.19.4 remains a legacy runtime compatibility target; Node 22/24 are recommended. Building this repository requires Node 22.13 or newer. Existing v1 declaration-path consumers retain a compatibility entry.

This is the review branch's release metadata, not evidence that v2 has been published. Native application acceptance and owner-controlled publishing configuration must pass before release.
