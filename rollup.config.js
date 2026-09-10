import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import { minify } from 'terser';

const minifyBrowserBundle = {
    name: 'minify-browser-bundle',
    async renderChunk(code, _chunk, outputOptions) {
        return minify(code, {
            sourceMap: outputOptions.sourcemap ? { asObject: true } : false,
        });
    },
};

const javascript = {
    input: 'src/index.ts',
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,
            declarationMap: false,
            noEmit: false,
        }),
    ],
    output: [
        { file: 'dist/index.js', format: 'esm', sourcemap: true },
        { file: 'dist/index.cjs', format: 'cjs', exports: 'named', interop: 'auto', sourcemap: true },
        { file: 'dist/fleetbase.min.js', format: 'umd', name: 'FleetbaseSdk', exports: 'named', sourcemap: true, plugins: [minifyBrowserBundle] },
    ],
};

const declarations = {
    input: '.types/index.d.ts',
    plugins: [dts()],
    output: [
        { file: 'dist/index.d.ts', format: 'es' },
        { file: 'dist/index.d.cts', format: 'es' },
    ],
};

export default [javascript, declarations];
