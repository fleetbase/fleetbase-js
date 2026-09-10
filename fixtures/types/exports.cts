import type { ManifestStore, ManifestStopStore, TrailerStore, VehicleStore, WorkOrderStore, WorkOrderSendResponse } from '@fleetbase/sdk';
import { Fleetbase } from '@fleetbase/sdk';
const client = new Fleetbase('fixture');
const stores: [ManifestStore, ManifestStopStore, TrailerStore, VehicleStore, WorkOrderStore] = [client.manifests, client.manifestStops, client.trailers, client.vehicles, client.workOrders];
const sent: Promise<WorkOrderSendResponse> = stores[4].send('work_order_1');
void sent;
