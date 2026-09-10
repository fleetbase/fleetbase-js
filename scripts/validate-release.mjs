import { readFile } from 'node:fs/promises';

const tag = process.argv[2];
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const notes = await readFile(new URL('../RELEASE.md', import.meta.url), 'utf8');
if (tag !== `v${pkg.version}` || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
    throw new Error('Release tag must exactly match package.json version.');
}
if (!notes.split('\n')[0].startsWith(`> ${tag} ~ `) || notes.includes('RELEASE_NOTES_PLACEHOLDER')) {
    throw new Error('RELEASE.md must contain current-version release notes, not a placeholder.');
}
const expectedDistTag = pkg.version.includes('-') ? 'next' : 'latest';
if (pkg.publishConfig.tag !== expectedDistTag) {
    throw new Error(`Expected npm dist-tag ${expectedDistTag}.`);
}
console.log(`Validated ${tag}, release notes, and npm dist-tag ${expectedDistTag}.`);
