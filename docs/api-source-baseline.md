# API source baseline

The v2 SDK contract was checked against these authoritative snapshots on 2026-08-31:

| Source                                                      | Commit                                                       | Purpose                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [fleetbase/postman](https://github.com/fleetbase/postman)   | `9a7d4d898b4e74d735d93c78d67d4d5013c1a28b`                   | Public request URLs, verbs, parameters, and example workflows               |
| [fleetbase/core-api](https://github.com/fleetbase/core-api) | `b7691c06ffdfe8f8874352e746aa8e523d5e3531`                   | Core authentication, organization, and API resource behavior                |
| [fleetbase/fleetops](https://github.com/fleetbase/fleetops) | `a9131daeb1a23ed4b0046dd2d7b632fb100bfba0`                   | Fleet-Ops routes, controllers, request validation, and serialized resources |
| Published `@fleetbase/sdk@1.2.13`                           | npm tarball SHA-1 `18796779c03c3e136e22a076244a706b036b8a59` | Existing runtime export and prototype contract                              |
| `dev-v1.2.14` candidate                                     | `69ace0808f8738bc4dc8b0930452c0d793217f8b`                   | Pending `serviceQuotes` store and service-quote action contract             |

The executable snapshots are in [`contracts/v1.2.13.json`](../contracts/v1.2.13.json) and [`contracts/v1.2.14-candidate.json`](../contracts/v1.2.14-candidate.json).

## Confirmed action mappings

| SDK action                    | HTTP contract                                               |
| ----------------------------- | ----------------------------------------------------------- |
| `orders.getDistanceAndTime`   | `GET /v1/orders/{id}/distance-and-time`                     |
| `orders.dispatch`             | `POST` or `PATCH /v1/orders/{id}/dispatch`                  |
| `orders.start`                | `POST /v1/orders/{id}/start`                                |
| `orders.updateActivity`       | `POST` or `PATCH /v1/orders/{id}/update-activity`           |
| `orders.setDestination`       | `POST` or `PATCH /v1/orders/{id}/set-destination/{placeId}` |
| `orders.captureQrCode`        | `POST /v1/orders/{id}/capture-qr/{subjectId?}`              |
| `orders.captureSignature`     | `POST /v1/orders/{id}/capture-signature/{subjectId?}`       |
| `orders.cancel`               | `DELETE /v1/orders/{id}/cancel`                             |
| `drivers.login` by phone      | `POST /v1/drivers/login-with-sms`                           |
| `drivers.verifyCode`          | `POST /v1/drivers/verify-code`                              |
| `drivers.track`               | `POST`, `PUT`, or `PATCH /v1/drivers/{id}/track`            |
| `drivers.syncDevice`          | `POST /v1/drivers/{id}/register-device`                     |
| `drivers.listOrganizations`   | `GET /v1/drivers/{id}/organizations`                        |
| `drivers.switchOrganization`  | `POST /v1/drivers/{id}/switch-organization`                 |
| `drivers.currentOrganization` | `GET /v1/drivers/{id}/current-organization`                 |
| `serviceQuotes.fromPayload`   | `GET /v1/service-quotes?payload={payloadId}`                |

## Known upstream drift

The v1.2.14 candidate added `serviceQuotes.fromPreliminary()`, which requests `GET /v1/service-quotes/preliminary`. The current Fleet-Ops public routes and Postman collection document query and retrieve operations at `/v1/service-quotes`, but not that preliminary subpath. V2 retains the method for SDK compatibility while treating live support as unverified. It must not be presented as a confirmed current endpoint until the server route or public documentation establishes the contract.
