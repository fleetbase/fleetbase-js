import Fleetbase from '@fleetbase/sdk';
import React from 'react';
import { createRoot } from 'react-dom/client';

const client = new Fleetbase('fixture_public_key');
createRoot(document.querySelector('#root')).render(<p>Fleetbase {client.version}</p>);
