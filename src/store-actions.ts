import { set } from './utils.js';
import type { StoreActionsLike } from './types.js';
import { register } from './registry.js';

export type StoreActionMap = Record<string, unknown>;

export function isStoreActions(value: unknown): value is StoreActions {
    return value instanceof StoreActions;
}

export function createStoreActions(name: string, ...params: ConstructorParameters<typeof StoreActions>): StoreActions {
    const actions = new StoreActions(...params);
    register('action', name, StoreActions);
    return actions;
}

export default class StoreActions {
    actions: StoreActionMap;
    bind: object | null;

    constructor(actions: StoreActionMap = {}, bind: object | null = null) {
        this.actions = actions;
        this.bind = bind;
    }

    extend(binding: object | null = null): this {
        const target = binding ?? this.bind;
        if (!target) {
            return this;
        }
        for (const [name, value] of Object.entries(this.actions)) {
            set(target, name, typeof value === 'function' ? value.bind(target) : value);
        }
        return this;
    }
}

export function extendStoreActions(store: object, actions: StoreActionsLike | StoreActionsLike[] = []): object {
    const list = Array.isArray(actions) ? actions : [actions];
    for (const action of list) {
        if (isStoreActions(action)) {
            action.extend(store);
        }
    }
    return store;
}
