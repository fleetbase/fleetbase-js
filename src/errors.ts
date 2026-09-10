export interface FleetbaseErrorOptions {
    status?: number;
    code?: string;
    response?: unknown;
    requestId?: string;
    cause?: unknown;
}

export class FleetbaseError extends Error {
    readonly status: number | undefined;
    readonly code: string | undefined;
    readonly response?: unknown;
    readonly requestId: string | undefined;

    constructor(message: string, options: FleetbaseErrorOptions = {}) {
        super(message, options.cause === undefined ? undefined : { cause: options.cause });
        this.name = 'FleetbaseError';
        this.status = options.status;
        this.code = options.code;
        this.response = options.response;
        this.requestId = options.requestId;
    }
}
