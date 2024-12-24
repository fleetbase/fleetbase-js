export default Order;
declare class Order extends Resource {
    constructor(attributes: {}, adapter: any, options?: {});
    getDistanceAndTime(params?: {}, options?: {}): any;
    dispatch(params?: {}, options?: {}): any;
    start(params?: {}, options?: {}): any;
    setDestination(destinationId: any, params?: {}, options?: {}): any;
    captureQrCode(subjectId?: any, params?: {}, options?: {}): any;
    captureSignature(subjectId?: any, params?: {}, options?: {}): any;
    getNextActivity(params?: {}, options?: {}): any;
    updateActivity(params?: {}, options?: {}): any;
    cancel(params?: {}, options?: {}): any;
    complete(params?: {}, options?: {}): any;
    get isDispatched(): boolean;
    get isNotDispatched(): boolean;
    get isStarted(): boolean;
    get isNotStarted(): boolean;
    get isCompleted(): boolean;
    get isCanceled(): boolean;
    get isEnroute(): boolean;
    get isInProgress(): boolean;
    get scheduledAt(): Date;
    get startedAt(): Date;
    get dispatchedAt(): Date;
    get status(): any;
}
export const orderActions: StoreActions;
import Resource from '../resource';
import { StoreActions } from '../utils';
