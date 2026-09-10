# Compatibility decisions

The v2 implementation preserves the published v1.2.13 root exports, client stores, and prototype method names through executable contract snapshots. The pending v1.2.14 `serviceQuotes` addition is also included.

## Compatible fixes

| Legacy behavior                                                                      | V2 decision                                                                                                    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `require('@fleetbase/sdk')` resolves an ambiguous module-scoped `.js` CommonJS file  | Emit a true `.cjs` entry with matching `.d.cts` declarations.                                                  |
| `Resource.empty()` writes to misspelled `attribues`                                  | Clear `attributes`.                                                                                            |
| `save({ onlyDirty: true })` calls missing `savedirty()`                              | Delegate to the existing `saveDirty()` API.                                                                    |
| Rejected resource requests leave loading/saving/reloading/destroying flags set       | Reset flags in `finally` blocks.                                                                               |
| `Fleetbase.setAdapter()` leaves existing stores on the previous adapter              | Update all stores while preserving the legacy `undefined` return value.                                        |
| `Store.destroy()` can lose the caller's third adapter-options argument               | Preserve the legacy three-argument adapter call and forward options.                                           |
| Valid longitudes between -90 and 90 are rejected                                     | Validate the standard -180 through 180 range.                                                                  |
| Array-subclass operations can construct sparse collections for a single numeric item | Use normal item semantics and a native Array species for derived operations.                                   |
| Browser responses assume every body is JSON                                          | Support JSON, text, and empty responses while retaining `parseJSON()` for direct consumers.                    |
| Browser and Node errors lose status and response context                             | Reject with `FleetbaseError`, which remains an `Error` and adds status, code, request ID, response, and cause. |
| Browser code attempts to set a forbidden `User-Agent` header                         | Do not set it in browser requests; retain the Node header.                                                     |
| React Native is classified as Node                                                   | Select the standards-based browser/fetch adapter.                                                              |

## Preserved quirks

- Resource instances retain an own `changes` history object, which shadows the legacy `Resource.prototype.changes()` function. The prototype name remains present for reflection compatibility.
- Browser adapter `request(path, method, { body, ...options })` continues to accept the legacy direct-request shape in addition to the typed internal data form.
- The `serviceQuotes.fromPreliminary()` candidate API remains available even though the current authoritative server sources do not confirm its route.

Any additional behavior change requires a failing regression test and an entry in this file.
