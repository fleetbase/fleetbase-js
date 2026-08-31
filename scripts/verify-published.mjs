import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = join(root, 'artifacts');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const tarballName = (await readdir(artifacts)).find((name) => name.endsWith('.tgz'));

if (!tarballName) {
    throw new Error('The locally published tarball is missing.');
}

const tarball = join(artifacts, tarballName);
const expectedHash = createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex');
const registry = new URL(process.env.npm_config_registry ?? 'https://registry.npmjs.org/');
const metadataUrl = new URL(`${encodeURIComponent(packageJson.name)}/${packageJson.version}`, registry);

async function registryMetadata() {
    let lastError;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
        try {
            const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(10_000) });
            if (response.ok) {
                return response.json();
            }
            lastError = new Error(`Registry metadata returned HTTP ${response.status}.`);
        } catch (error) {
            lastError = error;
        }
        if (attempt < 6) {
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 10_000));
        }
    }
    throw new Error('The published version did not become available from the registry.', { cause: lastError });
}

const metadata = await registryMetadata();
const remoteTarball = metadata?.dist?.tarball;
if (typeof remoteTarball !== 'string') {
    throw new Error('Registry metadata did not include a tarball URL.');
}

const response = await fetch(remoteTarball, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) {
    throw new Error(`Registry tarball returned HTTP ${response.status}.`);
}
const publishedHash = createHash('sha256')
    .update(Buffer.from(await response.arrayBuffer()))
    .digest('hex');
if (publishedHash !== expectedHash) {
    throw new Error(`Registry tarball checksum does not match ${basename(tarball)}.`);
}

const consumer = await mkdtemp(join(tmpdir(), 'fleetbase-sdk-release-'));
try {
    await writeFile(join(consumer, 'package.json'), JSON.stringify({ name: 'fleetbase-sdk-release-check', private: true, type: 'module' }));
    const install = spawnSync('npm', ['install', `${packageJson.name}@${packageJson.version}`, '--ignore-scripts', '--no-package-lock', '--registry', registry.href], {
        cwd: consumer,
        encoding: 'utf8',
        stdio: 'inherit',
    });
    if (install.status !== 0) {
        throw new Error(`Clean registry installation failed with exit code ${String(install.status)}.`);
    }

    for (const args of [
        ['--input-type=module', '-e', `import Fleetbase from '${packageJson.name}'; if (typeof Fleetbase !== 'function') process.exit(1)`],
        ['-e', `if (typeof require('${packageJson.name}').default !== 'function') process.exit(1)`],
    ]) {
        const runtime = spawnSync(process.execPath, args, { cwd: consumer, stdio: 'inherit' });
        if (runtime.status !== 0) {
            throw new Error(`Post-publish runtime verification failed with exit code ${String(runtime.status)}.`);
        }
    }
} finally {
    await rm(consumer, { recursive: true, force: true });
}

console.log(`Verified registry checksum and clean ESM/CommonJS installation for ${packageJson.name}@${packageJson.version}.`);
