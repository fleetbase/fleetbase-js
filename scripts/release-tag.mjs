import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function releaseTag(branch) {
    const match = /^(?:release\/|dev-)(v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(branch);
    if (!match) throw new Error('Expected release/v<version> (or legacy dev-v<version>).');
    return match[1];
}

export function createReleaseTag(cwd, branch) {
    const tag = releaseTag(branch);
    const git = (args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const target = git(['rev-parse', 'HEAD']);
    const existing = spawnSync('git', ['rev-parse', '--verify', `refs/tags/${tag}^{commit}`], { cwd, encoding: 'utf8' });
    if (existing.status === 0) {
        if (existing.stdout.trim() !== target) throw new Error(`${tag} already points to another commit; refusing to move it.`);
    } else {
        git(['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'tag', '-a', tag, '-m', `Release ${tag}`, target]);
    }
    // Never force a remote tag. A concurrent collision must fail, not overwrite.
    git(['push', 'origin', `refs/tags/${tag}`]);
    return { tag, commit: target };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    if (process.argv.includes('--name-only')) {
        console.log(releaseTag(process.argv[2]));
    } else {
        if (process.env.CI !== 'true' || process.env.GITHUB_ACTIONS !== 'true') {
            throw new Error('Release tag creation is restricted to GitHub Actions.');
        }
        console.log(createReleaseTag(process.cwd(), process.argv[2]));
    }
}
