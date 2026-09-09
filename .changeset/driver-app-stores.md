---
'@fleetbase/sdk': minor
---

Add first-class stores and resources for the FleetOps driver workflow: `manifests` (with `optimize` and `drivers.manifests`), `manifestStops` (PATCH `update`), `trailers` (CRUD plus `attach`, `detach`, `connections`, `track`, and `vehicles.trailers`), `fuelReports`, `issues`, `workOrders` (with `send`), `inspectionForms`, `inspections` (with `vehicles.inspections`), and the driver password actions `changePassword`, `forgotPassword`, and `resetPassword`. All additions are additive; no existing export, store, or method changes.
