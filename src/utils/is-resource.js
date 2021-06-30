import Resource from '../resource';

export default function isResource(record) {
    return record instanceof Resource;
}
