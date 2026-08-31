import Fleetbase from '@fleetbase/sdk';
import ClientSdk from './sdk-client';

const client = new Fleetbase('fixture_server_key');

export default function Page() {
    return (
        <main>
            Fleetbase {client.version}
            <ClientSdk />
        </main>
    );
}
