// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';

export default {
	input: 'lib/fleetbase.js',
	output: {
		format: 'umd',
		file: 'dist/bundle.js',
		name: '@fleetbase/sdk'
	},
	watch: {
		exclude: ['node_modules/**'],
    	include: ['lib/**']
	},
	plugins: [
	    resolve({
	      browser: true,
	      modulesOnly: true
	    }),
		terser(),
		eslint()
	]
};