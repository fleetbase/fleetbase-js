---
'@fleetbase/sdk': minor
---

Add first-class stores and resources for the Fleet-Ops driver workflow: `manifests` (with `optimize` and `drivers.manifests`), `manifestStops` (PATCH `update`), `trailers` (CRUD plus `attach`, `detach`, `connections`, `track`, and `vehicles.trailers`), `fuelReports`, `issues`, `workOrders` (with `send`), and the driver password actions `changePassword`, `forgotPassword`, and `resetPassword`. All additions are additive; no existing export, store, or method changes.

Trailer attach/detach and work-order send preserve resource identity and return typed connection/acknowledgement responses. Public store types are exported from the package root. Inspection APIs are deferred pending a released backend contract.
