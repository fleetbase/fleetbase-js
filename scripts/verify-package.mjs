import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const requiredFiles = new Set([
    'CHANGELOG.md',
    'LICENSE.md',
    'README.md',
    'dist/fleetbase.min.js',
    'dist/fleetbase.min.js.map',
    'dist/index.cjs',
    'dist/index.cjs.map',
    'dist/index.d.cts',
    'dist/index.d.ts',
    'dist/index.js',
    'dist/index.js.map',
    'package.json',
]);

const { stdout } = await execute('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { maxBuffer: 10 * 1024 * 1024 });
const [pack] = JSON.parse(stdout);
const files = new Set(pack.files.map(({ path }) => path));

for (const file of requiredFiles) {
    if (!files.has(file)) {
        throw new Error(`Packed artifact is missing required file: ${file}`);
    }
}

for (const file of files) {
    if (!requiredFiles.has(file) && !file.startsWith('dist/')) {
        throw new Error(`Packed artifact contains an unexpected file: ${file}`);
    }
}

if (pack.size > 250_000 || pack.unpackedSize > 1_000_000) {
    throw new Error(`Packed artifact exceeds the size budget (${pack.size} packed, ${pack.unpackedSize} unpacked).`);
}

const esm = await import(new URL(`../${packageJson.module}?verify=${Date.now()}`, import.meta.url));
const require = createRequire(import.meta.url);
const commonjs = require(fileURLToPath(new URL(`../${packageJson.main}`, import.meta.url)));
const esmKeys = Object.keys(esm).sort();
const commonjsKeys = Object.keys(commonjs).sort();

if (JSON.stringify(esmKeys) !== JSON.stringify(commonjsKeys)) {
    throw new Error(`ESM/CommonJS export mismatch:\nESM: ${esmKeys.join(', ')}\nCJS: ${commonjsKeys.join(', ')}`);
}

if (typeof esm.default !== 'function' || typeof commonjs.default !== 'function') {
    throw new Error('Default Fleetbase constructor is missing from an output format.');
}

for (const sourceMap of ['dist/index.js.map', 'dist/index.cjs.map', 'dist/fleetbase.min.js.map']) {
    const map = JSON.parse(await readFile(sourceMap, 'utf8'));
    if (!Array.isArray(map.sources) || map.sources.length === 0 || !Array.isArray(map.sourcesContent)) {
        throw new Error(`Source map is incomplete: ${sourceMap}`);
    }
}

console.log(`Verified ${files.size} packed files, ${pack.size} packed bytes, and ${esmKeys.length} parity-matched exports.`);
