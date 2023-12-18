import { lookup } from '../resolver';
import isNodeEnvironment from './is-node-environment';

const detectAdapter = (options = {}) => {
    if (isNodeEnvironment()) {
        return lookup('adapter', 'NodeAdapter', options);
    }

    return lookup('adapter', 'BrowserAdapter', options);
};

export default detectAdapter;
