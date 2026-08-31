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
} from '@fleetbase/sdk';

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
