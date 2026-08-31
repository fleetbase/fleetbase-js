# Contributing to Fleetbase SDK

Thank you for improving the Fleetbase JavaScript SDK.

## Requirements

- Node.js 22.13 or newer
- Corepack with the package's pinned pnpm version

## Development workflow

1. Create a focused branch from `main`.
2. Install exactly the locked dependencies with `pnpm install --frozen-lockfile`.
3. Add or update behavior-focused tests for every change and failure path.
4. Run `pnpm run verify` before opening a pull request.
5. Add a Changeset for user-visible package changes with `pnpm changeset`.

Pull-request tests must not depend on production Fleetbase credentials or mutable remote data. Use an injected adapter or Fetch implementation for deterministic tests.

## Compatibility

Existing default and named exports, constructors, stores, resources, adapter signatures, and return shapes are compatibility contracts. Call out any proposed public API change in the pull request and include runtime and type-level evidence.

## Pull requests

Describe the public API effect, tests and coverage, package artifact effect, risk, and rollback. Keep generated artifacts out of commits; CI builds and verifies the npm tarball from source.
