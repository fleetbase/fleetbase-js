import { set } from './object';

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
