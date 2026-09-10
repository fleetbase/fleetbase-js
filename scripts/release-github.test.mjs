import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { mirrorArtifact, validateArtifact } from './publish-github.mjs';

const bytes = Buffer.from('immutable release fixture');
const checksum = createHash('sha256').update(bytes).digest('hex');
const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const pkg = { name: '@fleetbase/sdk', version: '2.0.0', repository: { url: 'git+https://github.com/fleetbase/fleetbase-js.git' } };
const filename = 'fleetbase-sdk-2.0.0.tgz';
const checksums = `${checksum}  ${filename}\n`;

test('validates artifact identity, release version, filename, and checksum', () => {
    assert.deepEqual(validateArtifact('v2.0.0', pkg, filename, bytes, checksums), { spec: '@fleetbase/sdk@2.0.0', distTag: 'latest' });
    assert.throws(() => validateArtifact('v2.0.1', pkg, filename, bytes, checksums), /version/);
    assert.throws(() => validateArtifact('main', pkg, filename, bytes, checksums), /version/);
    assert.throws(() => validateArtifact('v2.0.0', { ...pkg, name: '@other/sdk' }, filename, bytes, checksums), /belong/);
    assert.throws(() => validateArtifact('v2.0.0', { ...pkg, repository: {} }, filename, bytes, checksums), /belong/);
    assert.throws(() => validateArtifact('v2.0.0', pkg, '../bad.tgz', bytes, checksums), /filename/);
    assert.throws(() => validateArtifact('v2.0.0', pkg, filename, Buffer.from('changed'), checksums), /checksum/);
    const version = '2.1.0-rc.1';
    const name = `fleetbase-sdk-${version}.tgz`;
    assert.equal(validateArtifact(`v${version}`, { ...pkg, version }, name, bytes, `${checksum}  ${name}`).distTag, 'next');
});

function runner({ existing, error, downloaded = bytes } = {}) {
    const calls = [];
    const run = (args) => {
        calls.push(args);
        if (args[0] === 'view') {
            if (error) throw error;
            if (existing) return existing;
            throw Object.assign(new Error('Not found'), { code: 'E404' });
        }
        if (args[0] === 'pack') {
            writeFileSync(join(args[args.indexOf('--pack-destination') + 1], filename), downloaded);
            return [{ filename }];
        }
        return {};
    };
    return { run, calls };
}

const artifact = { spec: '@fleetbase/sdk@2.0.0', distTag: 'latest', tarball: '/fixture/released.tgz', bytes };

test('publishes the original tarball without scripts or npm provenance and verifies downloaded bytes', async () => {
    const { run, calls } = runner();
    assert.equal(await mirrorArtifact({ ...artifact, run }), 'published and verified');
    assert.deepEqual(calls[1], ['publish', artifact.tarball, '--ignore-scripts', '--provenance=false', '--tag', 'latest', '--json']);
    assert.equal(calls[2][0], 'pack');
});

test('retry verifies an identical existing version without republishing', async () => {
    for (const existing of [{ integrity }, { shasum: createHash('sha1').update(bytes).digest('hex') }]) {
        const { run, calls } = runner({ existing });
        assert.equal(await mirrorArtifact({ ...artifact, run }), 'verified existing');
        assert.deepEqual(
            calls.map(([command]) => command),
            ['view', 'pack']
        );
    }
});

test('refuses conflicts and authentication errors without publishing', async () => {
    const conflict = runner({ existing: { integrity: 'sha512-wrong' } });
    await assert.rejects(mirrorArtifact({ ...artifact, run: conflict.run }), /different bytes/);
    assert.equal(conflict.calls.length, 1);
    const denied = runner({ error: Object.assign(new Error('Unauthorized'), { code: 'E401' }) });
    await assert.rejects(mirrorArtifact({ ...artifact, run: denied.run }), /Unauthorized/);
    assert.equal(denied.calls.length, 1);
});

test('rejects registry tarballs that differ from the released bytes', async () => {
    const { run } = runner({ downloaded: Buffer.from('wrong artifact') });
    await assert.rejects(mirrorArtifact({ ...artifact, run }), /differs/);
});

test('CLI refuses publication outside GitHub Actions', () => {
    const result = spawnSync(process.execPath, ['scripts/publish-github.mjs', 'v2.0.0'], { env: { ...process.env, CI: '', GITHUB_ACTIONS: '' }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /restricted to GitHub Actions/);
});
