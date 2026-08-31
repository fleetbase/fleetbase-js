# Compatibility policy

Every supported consumer gate installs the exact tarball produced by the CI package job. Fixtures never import SDK workspace source.

## Release-blocking coverage

| Dimension        | Verified targets                                                              |
| ---------------- | ----------------------------------------------------------------------------- |
| Node.js          | 22.13 minimum and current 24; Linux, macOS, and Windows                       |
| Modules          | native ESM and true CommonJS                                                  |
| TypeScript       | strict Node16, NodeNext, and bundler resolution                               |
| Package managers | npm, pnpm 11, Yarn 4, and Bun 1                                               |
| Bundlers         | Vite 8, webpack 5, and esbuild                                                |
| Frameworks       | React 19, Vue 3, Svelte 5, Next.js 16 client/server, and Nuxt 4 client/server |

Framework fixtures use Node 22.22.2 because the current Nuxt toolchain requires Node 22.19 or newer. This does not change the SDK's separately tested Node 22.13 runtime floor.

Angular, Ember, Expo/React Native, browser automation, and an edge-runtime fixture remain explicit prerelease gates before the stable v2 support table can be finalized.
