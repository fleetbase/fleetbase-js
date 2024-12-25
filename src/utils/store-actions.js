import { set } from './object.js';
import { isArray } from './array.js';

export function isStoreActions(target) {
    return target instanceof StoreActions;
}

export function extendStoreActions(store, actions = []) {
    store.actions = isArray(actions) ? actions : [actions];

    if (isArray(actions)) {
        for (const element of actions) {
            store.extendActions(element);
        }
        return;
    }

    if (isStoreActions(actions)) {
        actions.extend(store);
    }

    return store;
}

export default class StoreActions {
    constructor(actions = {}, bind = null) {
        this.actions = actions;
        this.bind = bind;
    }

    extend(bindTo = null) {
        const binding = bindTo || this.bind;

        if (!binding) {
            return this;
        }

        if (this?.actions && typeof this.actions === 'object') {
            for (let action in this.actions) {
                const fn = this.actions[action];

                if (typeof fn !== 'function') {
                    set(binding, action, fn);
                    continue;
                }

                set(binding, action, fn.bind(binding));
            }
        }

        return this;
    }
}
