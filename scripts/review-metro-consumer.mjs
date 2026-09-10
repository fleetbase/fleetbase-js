import path from 'node:path';
import { createRequire } from 'node:module';
if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
    throw new Error('Usage: node scripts/review-metro-consumer.mjs <app checkout> <extracted SDK package> <output bundle> [android|ios]');
}
const appRoot = path.resolve(process.argv[2]);
const candidate = path.resolve(process.argv[3]);
const output = process.argv[4];
const requireApp = createRequire(path.join(appRoot, 'package.json'));
(async () => {
    const Metro = requireApp('metro');
    const { loadConfig } = requireApp('metro-config');
    const config = await loadConfig({ cwd: appRoot, config: path.join(appRoot, 'metro.config.js') });
    const previous = config.resolver.resolveRequest;
    config.projectRoot = appRoot;
    config.maxWorkers = 2;
    config.watchFolders = [...config.watchFolders, candidate];
    config.resolver.useWatchman = false;
    // The extracted tarball is outside the app; resolve Babel-injected helpers
    // from the same node_modules used by a normal in-app package installation.
    config.resolver.nodeModulesPaths = [...config.resolver.nodeModulesPaths, path.join(appRoot, 'node_modules')];
    config.resolver.resolveRequest = (context, name, platform) => {
        if (name === '@fleetbase/sdk') return { type: 'sourceFile', filePath: path.join(candidate, 'dist/index.js') };
        return previous ? previous(context, name, platform) : context.resolveRequest(context, name, platform);
    };
    await Metro.runBuild(config, { entry: 'index.js', platform: process.argv[5] ?? 'android', dev: false, minify: true, out: output });
    console.log('PASS candidate Metro bundle:', appRoot);
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
