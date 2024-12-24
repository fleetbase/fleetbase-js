class Adapter {
    /**
     * Creates a configured base adapter for Fleetbase.
     *
     * @param  {Object} config Configuration options for adapter
     */
    constructor(config = {}) {
        this.version = config.version || 'v1';
        this.host = config.host || null;
        this.namespace = config.namespace || null;
        this.headers = config.headers || {};
    }
}

export default Adapter;
