import BrowserAdapter from './browser.js';
import NodeAdapter from './node.js';
import { isNodeEnvironment } from '../utils.js';
import type { AdapterConfig, AdapterLike } from '../types.js';

export function detectAdapter(config: AdapterConfig = {}): AdapterLike {
    return isNodeEnvironment() ? new NodeAdapter(config) : new BrowserAdapter(config);
}

export default detectAdapter;
