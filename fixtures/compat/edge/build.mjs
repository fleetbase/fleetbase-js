import { EdgeVM } from '@edge-runtime/vm';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

await build({
    bundle: true,
    entryPoints: ['entry.js'],
    format: 'iife',
    globalName: 'SdkFixture',
    outfile: 'dist/index.js',
    platform: 'browser',
});

const vm = new EdgeVM();
vm.evaluate(await readFile('dist/index.js', 'utf8'));
const result = vm.evaluate('[typeof SdkFixture.client, typeof SdkFixture.adapter.request, SdkFixture.point.coordinates.join(",")].join(":")');

if (result !== 'object:function:2,1') {
    throw new Error(`Unexpected edge runtime result: ${String(result)}`);
}
