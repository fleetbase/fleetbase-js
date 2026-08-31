import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = join(root, 'artifacts');
const dryRun = process.argv.includes('--dry-run');

if (!dryRun && (process.env.CI !== 'true' || process.env.GITHUB_ACTIONS !== 'true')) {
    throw new Error('Registry publication is restricted to GitHub Actions. Use --dry-run to validate locally.');
}

await mkdir(artifacts, { recursive: true });
const existing = await readdir(artifacts);
if (existing.length > 0) {
    throw new Error('The artifacts directory must be empty before publication.');
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit' });
    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(' ')} failed with exit code ${String(result.status)}.`);
    }
    return result.stdout;
}

const packed = JSON.parse(run('npm', ['pack', '--pack-destination', artifacts, '--json'], { capture: true }));
const filename = packed[0]?.filename;
if (typeof filename !== 'string') {
    throw new Error('npm pack did not report a release tarball.');
}

const tarball = join(artifacts, filename);
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const tag = String(packageJson.version).includes('-') ? 'next' : 'latest';
const checksum = createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex');
await writeFile(join(artifacts, 'SHA256SUMS'), `${checksum}  ${filename}\n`);

let alreadyPublished = false;
if (!dryRun) {
    const registry = new URL(process.env.npm_config_registry ?? 'https://registry.npmjs.org/');
    const metadataUrl = new URL(`${encodeURIComponent(packageJson.name)}/${packageJson.version}`, registry);
    const metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(10_000) });
    if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        const remoteTarball = metadata?.dist?.tarball;
        if (typeof remoteTarball !== 'string') {
            throw new Error('Existing registry metadata did not include a tarball URL.');
        }
        const remoteResponse = await fetch(remoteTarball, { signal: AbortSignal.timeout(30_000) });
        if (!remoteResponse.ok) {
            throw new Error(`Existing registry tarball returned HTTP ${remoteResponse.status}.`);
        }
        const remoteHash = createHash('sha256')
            .update(Buffer.from(await remoteResponse.arrayBuffer()))
            .digest('hex');
        if (remoteHash !== checksum) {
            throw new Error('The package version already exists with a different tarball checksum.');
        }
        alreadyPublished = true;
    } else if (metadataResponse.status !== 404) {
        throw new Error(`Registry metadata check returned HTTP ${metadataResponse.status}.`);
    }
}

if (!alreadyPublished) {
    run('npm', ['publish', tarball, '--access', 'public', '--provenance', '--tag', tag, ...(dryRun ? ['--dry-run'] : [])]);
}
console.log(`${dryRun ? 'Validated' : alreadyPublished ? 'Confirmed existing' : 'Published'} ${packageJson.name}@${packageJson.version} from ${filename} with dist-tag ${tag}.`);
