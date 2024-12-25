import Adapter from '../adapter.js';
import { register } from '../registry.js';

export default class EmberJsAdapter extends Adapter {}

register('adapter', 'EmberJsAdapter', EmberJsAdapter);
