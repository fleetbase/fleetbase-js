import { lookup } from '../resolver.js';
import isNodeEnvironment from './is-node-environment.js';

export function detectAdapter(options = {}) {
    if (isNodeEnvironment()) {
        return lookup('adapter', 'NodeAdapter', options);
    }

    return lookup('adapter', 'BrowserAdapter', options);
}

export default detectAdapter;
