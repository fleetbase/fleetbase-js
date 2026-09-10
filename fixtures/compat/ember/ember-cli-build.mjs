import { compatBuild } from '@embroider/compat';
import { buildOnce } from '@embroider/vite';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

export default function build(defaults) {
    return compatBuild(new EmberApp(defaults, {}), buildOnce);
}
