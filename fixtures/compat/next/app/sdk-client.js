'use client';

import Fleetbase from '@fleetbase/sdk';

const client = new Fleetbase('fixture_public_key');

export default function ClientSdk() {
    return <span> client {client.version}</span>;
}
