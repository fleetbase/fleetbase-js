> v2.1.0 ~ "Driver workflows, realtime socket tokens and a working Node transport"

## Highlights

- Fleet-Ops driver workflow stores: `manifests` (with `optimize` and `drivers.manifests`), `manifestStops`, `trailers` (CRUD, `attach`, `detach`, `connections`, `track`, `vehicles.trailers`), `fuelReports`, `issues` and `workOrders` (with `send`), plus the driver password actions `changePassword`, `forgotPassword` and `resetPassword`.
- `fleetbase.socket.token()` mints short-lived realtime socket tokens (`POST socket/token`) for server-side code that holds a secret key or user token.
- `NodeAdapter` requests work: GET requests reach the right path, and headers set after construction with `setHeaders` are sent. Node consumers of v2.0.0, including the Storefront SDK under Node, should upgrade.

## Compatibility

All additions are additive; no export, store or method changes. Node 20.19.4 remains a legacy runtime target; Node 22/24 are recommended.

This is the release branch's metadata, not evidence that v2.1.0 has been published. Merging this release PR into `main` tags and publishes it.
