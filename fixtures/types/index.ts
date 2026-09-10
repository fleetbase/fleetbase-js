import Fleetbase, {
    BrowserAdapter,
    Collection,
    FleetbaseError,
    NodeAdapter,
    Order,
    Place,
    Resource,
    Store,
    type Adapter,
    type AdapterOptions,
    type ResourceAttributes,
    type ManifestStore,
    type ManifestStopStore,
    type TrailerStore,
    type VehicleStore,
    type WorkOrderStore,
    type AssetConnectionAttributes,
    type TrailerDetachResponse,
    type WorkOrderSendResponse,
} from '@fleetbase/sdk';
import LegacyFleetbase from './node_modules/@fleetbase/sdk/types/fleetbase.js';

const options: AdapterOptions = { host: 'https://api.example.test', namespace: 'v1', publicKey: 'test-token' };
const adapter: Adapter = new BrowserAdapter(options);
const client = new Fleetbase('test-token', options);
client.setAdapter(adapter);

const nodeAdapter: Adapter = new NodeAdapter(options);
const store: Store<Order> = client.orders;
const attributes: ResourceAttributes = { id: 'order_123', status: 'created' };
const order: Promise<Order> = store.create(attributes);
const place: Promise<Place> = client.places.create({ name: 'Warehouse' });
const resources: Collection<Resource> = new Collection(new Order(attributes), new Place({ name: 'Warehouse' }));

void nodeAdapter;
void order;
void place;
void resources;
void FleetbaseError;

const legacy: Fleetbase = new LegacyFleetbase('fixture');
const manifests: ManifestStore = client.manifests;
const stops: ManifestStopStore = client.manifestStops;
const trailers: TrailerStore = client.trailers;
const vehicles: VehicleStore = client.vehicles;
const workOrders: WorkOrderStore = client.workOrders;
const connection: Promise<AssetConnectionAttributes> = trailers.attach('trailer_1');
const detached: Promise<TrailerDetachResponse> = trailers.detach('trailer_1');
const sent: Promise<WorkOrderSendResponse> = workOrders.send('work_order_1');
void [legacy, manifests, stops, vehicles, connection, detached, sent];
