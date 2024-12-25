import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

const input = ['src/fleetbase.js'];
const plugins = [
    nodeResolve({
        browser: true,
        modulesOnly: true,
    }),
    babel({
        babelHelpers: 'bundled',
    }),
    terser(),
];

export default [
    {
        input,
        plugins,
        output: [
            {
                file: 'dist/fleetbase.min.js',
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
        external: [],
    },
    {
        input,
        plugins,
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
        external: [],
    },
];
