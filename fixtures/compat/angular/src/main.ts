import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import Fleetbase from '@fleetbase/sdk';

const client = new Fleetbase('fixture_public_key');

@Component({
    selector: 'sdk-root',
    standalone: true,
    template: '<p>Fleetbase {{ version }}</p>',
})
class App {
    version = client.version;
}

void bootstrapApplication(App);
