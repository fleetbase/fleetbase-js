import Fleetbase, { Point } from '@fleetbase/sdk';
import React from 'react';
import { Text, View } from 'react-native';

const client = new Fleetbase('fixture_public_key');
const point = new Point(1, 2);

export default function App() {
    return React.createElement(View, null, React.createElement(Text, null, `Fleetbase ${client.version} ${point.coordinates.join(',')}`));
}
