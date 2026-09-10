import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createReleaseTag, releaseTag } from './release-tag.mjs';

test('release branch names select stable, prerelease, and legacy tags', () => {
    assert.equal(releaseTag('release/v2.0.0'), 'v2.0.0');
    assert.equal(releaseTag('release/v2.1.0-rc.1'), 'v2.1.0-rc.1');
    assert.equal(releaseTag('dev-v2.0.0'), 'v2.0.0');
    for (const branch of ['main', 'feature/release', 'release/v2.0', 'release/v2.0.0;echo bad', 'release/v2.0.0/extra', undefined]) {
        assert.throws(() => releaseTag(branch), /Expected release/);
    }
});

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'fleetbase-tag-test-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const cwd = join(root, 'checkout');
    const remote = join(root, 'remote.git');
    const git = (args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    execFileSync('git', ['init', '--bare', remote], { stdio: 'pipe' });
    execFileSync('git', ['init', '-b', 'main', cwd], { stdio: 'pipe' });
    git(['config', 'user.name', 'Release fixture']);
    git(['config', 'user.email', 'fixture@example.test']);
    git(['commit', '--allow-empty', '-m', 'Reviewed release']);
    git(['remote', 'add', 'origin', remote]);
    return { cwd, git, remote };
}

test('tags and pushes the checked-out merge commit, not a newer main, and retries safely', (t) => {
    const { cwd, git } = fixture(t);
    const reviewed = git(['rev-parse', 'HEAD']);
    git(['commit', '--allow-empty', '-m', 'Later main change']);
    git(['checkout', '--detach', reviewed]);
    const first = createReleaseTag(cwd, 'release/v2.0.0');
    assert.deepEqual(first, { tag: 'v2.0.0', commit: reviewed });
    assert.equal(git(['cat-file', '-t', 'v2.0.0']), 'tag');
    assert.equal(git(['rev-parse', 'v2.0.0^{commit}']), reviewed);
    assert.ok(git(['ls-remote', 'origin', 'refs/tags/v2.0.0^{}']).startsWith(reviewed));
    assert.deepEqual(createReleaseTag(cwd, 'release/v2.0.0'), first);
});

test('refuses a tag belonging to another commit', (t) => {
    const { cwd, git } = fixture(t);
    createReleaseTag(cwd, 'release/v2.0.0');
    git(['commit', '--allow-empty', '-m', 'Different commit']);
    assert.throws(() => createReleaseTag(cwd, 'release/v2.0.0'), /refusing to move/);
});

test('does not force a remote tag collision', (t) => {
    const { cwd, git } = fixture(t);
    createReleaseTag(cwd, 'release/v2.0.0');
    const remoteBefore = git(['ls-remote', 'origin', 'refs/tags/v2.0.0']);
    git(['tag', '-d', 'v2.0.0']);
    git(['commit', '--allow-empty', '-m', 'Concurrent release']);
    assert.throws(() => createReleaseTag(cwd, 'release/v2.0.0'));
    assert.equal(git(['ls-remote', 'origin', 'refs/tags/v2.0.0']), remoteBefore);
});

test('CLI cannot create real repository tags outside Actions', () => {
    const result = spawnSync(process.execPath, ['scripts/release-tag.mjs', 'release/v2.0.0'], { env: { ...process.env, CI: '', GITHUB_ACTIONS: '' }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /restricted to GitHub Actions/);
});
