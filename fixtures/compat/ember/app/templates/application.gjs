import Fleetbase, { Point } from '@fleetbase/sdk';

const client = new Fleetbase('fixture_public_key');
const point = new Point(1, 2);

<template><p>Fleetbase {{client.version}} {{point.coordinates}}</p></template>
