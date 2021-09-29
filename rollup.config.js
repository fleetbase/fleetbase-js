// rollup.config.js
import { terser } from 'rollup-plugin-terser';
// import { eslint } from 'rollup-plugin-eslint';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const input = ['src/fleetbase.js'];

export default [
    {
        // umd
        input,
        plugins: [
            nodeResolve({
                browser: true,
                modulesOnly: true,
            }),
            babel({
				babelHelpers: 'bundled',
			}),
            terser(),
        ],
        output: [
            {
                file: `dist/${pkg.name}.min.js`,
                format: 'umd',
                name: '@fleetbase/sdk',
                esModule: false,
                exports: 'named',
                sourcemap: true,
            },
        ],
        watch: {
            exclude: ['node_modules/**'],
            include: ['lib/**'],
        },
        external: ['axios']
    },
    {
        // esm and cjs
        input,
        plugins: [
            nodeResolve({
                browser: true,
                modulesOnly: true,
            }),
			babel({
				babelHelpers: 'bundled',
			}),
			terser()
        ],
        output: [
            {
                dir: 'dist/esm',
                format: 'esm',
                exports: 'named',
                sourcemap: true,
            },
            {
                dir: 'dist/cjs',
                format: 'cjs',
                exports: 'named',
                sourcemap: true,
            },
        ],
        external: ['axios']
    },
];
