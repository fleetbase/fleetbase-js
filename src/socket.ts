import type { AdapterLike, RequestOptions } from './types.js';

/** Response of every Fleetbase socket token mint route. */
export interface SocketTokenResponse {
    /** Short-lived HS256 JWT to hand to the realtime client (`socket.authenticate(token)`). */
    token: string;
    /** Lifetime of the token in seconds. Refresh about 60 seconds before it elapses. */
    expires_in: number;
    /** Expiry as an ISO 8601 timestamp. */
    expires_at: string;
}

/**
 * Realtime (SocketCluster) helpers.
 *
 * Mint socket tokens on a server with a secret key, then pass only the short-lived token
 * to the browser or device that opens the realtime connection.
 */
export default class Socket {
    adapter: AdapterLike;

    constructor(adapter: AdapterLike) {
        this.adapter = adapter;
    }

    /**
     * `POST socket/token` — mint a short-lived realtime token for the authenticating credential.
     * For an API key the token authorizes subscriptions to the key's company channel
     * (`company.{company uuid}`), its own `api.{key id}` channel, and resource channels of the
     * same company. For a driver's user token it is scoped to that driver's own channels.
     */
    token(options: RequestOptions = {}): Promise<SocketTokenResponse> {
        return this.adapter.post('socket/token', {}, options) as Promise<SocketTokenResponse>;
    }
}
