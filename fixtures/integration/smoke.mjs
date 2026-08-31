import Fleetbase from '@fleetbase/sdk';

const publicKey = process.env.FLEETBASE_PUBLIC_KEY;
const host = process.env.FLEETBASE_API_HOST ?? 'https://api.fleetbase.io';
const namespace = process.env.FLEETBASE_API_NAMESPACE ?? 'v1';

if (!publicKey) {
    throw new Error('FLEETBASE_PUBLIC_KEY is required.');
}

const client = new Fleetbase(publicKey, { host, namespace });
const organization = await client.organizations.current({}, { signal: AbortSignal.timeout(15_000) });

if (!organization || typeof organization !== 'object' || !('id' in organization) || !organization.id) {
    throw new Error('The current organization endpoint returned an unexpected response.');
}

console.log(`Live SDK smoke passed for namespace ${namespace}.`);
