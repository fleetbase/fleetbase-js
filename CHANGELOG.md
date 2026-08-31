# Changelog

All notable changes to the Fleetbase JavaScript SDK are documented here. This project follows semantic versioning.

## 2.0.0-next.0

### Changed

- Rebuilt the SDK in strict TypeScript while preserving the existing root API.
- Added correct native ESM, CommonJS, declaration, source-map, and browser outputs.
- Replaced live production API tests with deterministic transport and SDK contract tests.
- Added enforced 100% statement, branch, function, and line coverage.
- Standardized browser and Node.js transports on the Fetch API and added structured `FleetbaseError` details.

### Fixed

- Corrected CommonJS loading, type resolution, resource flag cleanup, dirty-only saves, resource emptying, collection behavior, longitude validation, adapter propagation, and response parsing.
