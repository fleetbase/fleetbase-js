import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const registry = 'https://npm.pkg.github.com';
const hash = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');

export function validateArtifact(tag, pkg, filename, bytes, checksums) {
    if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag) || tag !== `v${pkg.version}`) {
        throw new Error('Release tag and artifact version must agree.');
    }
    if (pkg.name !== '@fleetbase/sdk' || pkg.repository?.url !== 'git+https://github.com/fleetbase/fleetbase-js.git') {
        throw new Error('Artifact must belong to @fleetbase/sdk in fleetbase/fleetbase-js.');
    }
    if (filename !== `fleetbase-sdk-${pkg.version}.tgz` || checksums.trim() !== `${hash(bytes)}  ${filename}`) {
        throw new Error('Release artifact checksum or filename does not match.');
    }
    return { spec: `${pkg.name}@${pkg.version}`, distTag: pkg.version.includes('-') ? 'next' : 'latest' };
}

export function npmCommand(args) {
    const result = spawnSync('npm', [...args, '--registry', registry], { encoding: 'utf8' });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        let code;
        try {
            code = JSON.parse(result.stdout).error?.code;
        } catch {
            // npm can fail before producing JSON; never log authentication-related output.
        }
        throw Object.assign(new Error(`GitHub Packages npm ${args[0]} failed (${code ?? result.status}).`), { code });
    }
    return JSON.parse(result.stdout);
}

export async function mirrorArtifact({ spec, distTag, tarball, bytes, run = npmCommand }) {
    let existing;
    try {
        existing = run(['view', spec, 'dist', '--json']);
    } catch (error) {
        if (error.code !== 'E404') throw error;
    }
    if (existing) {
        const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
        if (existing.integrity ? existing.integrity !== integrity : existing.shasum !== hash(bytes, 'sha1')) {
            throw new Error('GitHub Packages already has different bytes for this version; refusing to overwrite.');
        }
    } else {
        // The tarball's npm provenance setting must not be applied to GitHub's registry.
        run(['publish', tarball, '--ignore-scripts', '--provenance=false', '--tag', distTag, '--json']);
    }

    const destination = await mkdtemp(join(tmpdir(), 'fleetbase-github-verify-'));
    try {
        const packed = run(['pack', spec, '--ignore-scripts', '--pack-destination', destination, '--json']);
        const filename = packed[0]?.filename;
        if (!filename || filename !== filename.split(/[\\/]/).pop()) throw new Error('Invalid registry tarball filename.');
        const downloaded = await readFile(join(destination, filename));
        if (hash(downloaded) !== hash(bytes)) throw new Error('GitHub Packages downloaded tarball differs from the release artifact.');
    } finally {
        await rm(destination, { recursive: true, force: true });
    }
    return existing ? 'verified existing' : 'published and verified';
}

async function main() {
    if (process.env.CI !== 'true' || process.env.GITHUB_ACTIONS !== 'true') {
        throw new Error('GitHub Packages publication is restricted to GitHub Actions.');
    }
    if (!process.env.NODE_AUTH_TOKEN) throw new Error('GitHub Packages requires NODE_AUTH_TOKEN.');
    const tag = process.argv[2];
    const directory = resolve('artifacts');
    const tarballs = (await readdir(directory)).filter((name) => name.endsWith('.tgz'));
    if (tarballs.length !== 1) throw new Error('Expected exactly one release tarball.');
    const filename = tarballs[0];
    const tarball = join(directory, filename);
    const bytes = await readFile(tarball);
    const pkg = JSON.parse(execFileSync('tar', ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' }));
    const metadata = validateArtifact(tag, pkg, filename, bytes, await readFile(join(directory, 'SHA256SUMS'), 'utf8'));

    // The published npm bytes are the independent source of truth for recovery, too.
    const response = await fetch(`https://registry.npmjs.org/@fleetbase%2Fsdk/${pkg.version}`, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`npm release metadata returned HTTP ${response.status}.`);
    const npmMetadata = await response.json();
    const npmTarball = new URL(npmMetadata.dist.tarball);
    if (npmTarball.origin !== 'https://registry.npmjs.org') throw new Error('Unexpected npm tarball origin.');
    const published = await fetch(npmTarball, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
    if (!published.ok || hash(Buffer.from(await published.arrayBuffer())) !== hash(bytes)) {
        throw new Error('Release artifact does not match the already published npm bytes.');
    }
    const result = await mirrorArtifact({ ...metadata, tarball, bytes });
    console.log(`${result}: ${metadata.spec} on GitHub Packages, identical to npm and the release asset.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
