import Fleetbase, { BrowserAdapter, Point } from '@fleetbase/sdk';

export const client = new Fleetbase('fixture_public_key');
export const adapter = new BrowserAdapter({ publicKey: 'fixture_public_key' });
export const point = new Point(1, 2);
