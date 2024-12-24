export class Resolver {
    constructor(...args: any[]);
    resources: {
        Contact: typeof Contact;
        Driver: typeof Driver;
        Entity: typeof Entity;
        Order: typeof Order;
        Payload: typeof Payload;
        Place: typeof Place;
        TrackingStatus: typeof TrackingStatus;
        Vehicle: typeof Vehicle;
        Vendor: typeof Vendor;
        Waypoint: typeof Waypoint;
        Zone: typeof Zone;
        ServiceArea: typeof ServiceArea;
        ServiceRate: typeof ServiceRate;
        ServiceQuote: typeof ServiceQuote;
    };
    adapters: {
        BrowserAdapter: typeof BrowserAdapter;
        NodeAdapter: typeof NodeAdapter;
        EmberJsAdapter: typeof EmberJsAdapter;
    };
    lookup(type: any, className: any, ...args: any[]): any;
}
export function lookup(...args: any[]): Resolver;
import { Contact } from './resources';
import { Driver } from './resources';
import { Entity } from './resources';
import { Order } from './resources';
import { Payload } from './resources';
import { Place } from './resources';
import { TrackingStatus } from './resources';
import { Vehicle } from './resources';
import { Vendor } from './resources';
import { Waypoint } from './resources';
import { Zone } from './resources';
import { ServiceArea } from './resources';
import { ServiceRate } from './resources';
import { ServiceQuote } from './resources';
import { BrowserAdapter } from './adapters';
import { NodeAdapter } from './adapters';
import { EmberJsAdapter } from './adapters';
