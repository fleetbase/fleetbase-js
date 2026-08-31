import Fleetbase, { BrowserAdapter, Point } from '@fleetbase/sdk';

const status = document.querySelector('[data-testid="sdk-status"]');

async function verify() {
    const requests = [];
    const fetch = async (url, options) => {
        requests.push({ url, options });
        return new Response(JSON.stringify({ id: 'order_1', status: 'created' }), {
            headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'request_1' },
            status: 200,
        });
    };
    const adapter = new BrowserAdapter({ fetch, host: 'https://fixture.invalid', namespace: 'v1', publicKey: 'fixture_public_key' });
    const client = new Fleetbase('fixture_public_key', { adapter });
    const point = new Point(1, 2);
    const order = await client.orders.findRecord('order_1');

    let rejectedSecret = false;
    try {
        new Fleetbase('$fixture_secret_key');
    } catch {
        rejectedSecret = true;
    }

    const request = requests[0];
    const authorization = new Headers(request.options.headers).get('Authorization');
    const passed =
        client.getAdapter() instanceof BrowserAdapter &&
        point.coordinates.join(',') === '2,1' &&
        order.id === 'order_1' &&
        request.url === 'https://fixture.invalid/v1/orders/order_1' &&
        authorization === 'Bearer fixture_public_key' &&
        rejectedSecret;

    if (!passed) {
        throw new Error('Browser SDK contract did not match expected behavior.');
    }

    status.textContent = 'passed';
}

verify().catch((error) => {
    status.textContent = `failed: ${error instanceof Error ? error.message : String(error)}`;
    throw error;
});
