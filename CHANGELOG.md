# Changelog

All notable changes to the Fleetbase JavaScript SDK are documented here. This project follows semantic versioning.

## 2.1.0

### Added

- Fleet-Ops driver workflow stores and resources: `manifests` (with `optimize` and `drivers.manifests`), `manifestStops` (PATCH `update`), `trailers` (CRUD plus `attach`, `detach`, `connections`, `track` and `vehicles.trailers`), `fuelReports`, `issues` and `workOrders` (with `send`), and the driver password actions `changePassword`, `forgotPassword` and `resetPassword`.
- `fleetbase.socket.token()` to mint realtime socket tokens.

### Fixed

- `NodeAdapter` sent GET requests to the wrong path and ignored headers set after construction; it now shares the browser Fetch transport.

## 2.0.0

### Changed

- Rebuilt the SDK in strict TypeScript while preserving the existing root API.
- Added correct native ESM, CommonJS, declaration, source-map, and browser outputs.
- Replaced live production API tests with deterministic transport and SDK contract tests.
- Added enforced 100% statement, branch, function, and line coverage.
- Standardized browser and Node.js transports on the Fetch API and added structured `FleetbaseError` details.

### Fixed

- Corrected CommonJS loading, type resolution, resource flag cleanup, dirty-only saves, resource emptying, collection behavior, longitude validation, adapter propagation, and response parsing.
- Preserved BrowserAdapter subclass interception, serialized mutation envelopes, spreadable headers, and plain GeoJSON driver coordinates for first-party consumers.
- Retained the legacy declaration entry and Node 20.19.4 runtime compatibility independently of build tooling.
