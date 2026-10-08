---
'@fleetbase/sdk': minor
---

Add `fleetbase.socket.token()` (`POST socket/token`) to mint a short-lived realtime socket token server-side. It resolves to `{ token, expires_in, expires_at }` (`SocketTokenResponse`) and follows `setAdapter`. Additive; no existing export, store, or method changes.
