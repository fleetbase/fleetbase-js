<script setup>
import Fleetbase from '@fleetbase/sdk';

const client = new Fleetbase('fixture_public_key');
</script>

<template>
    <p>Fleetbase {{ client.version }}</p>
</template>
