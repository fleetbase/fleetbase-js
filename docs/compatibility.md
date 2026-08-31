# Compatibility policy

Every supported consumer gate installs the exact tarball produced by the CI package job. Fixtures never import SDK workspace source.

## Release-blocking coverage

| Dimension         | Verified targets                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js           | 22.13 minimum and current 24; Linux, macOS, and Windows                                                                                                           |
| Modules           | native ESM and true CommonJS                                                                                                                                      |
| TypeScript        | strict Node16, NodeNext, and bundler resolution                                                                                                                   |
| Package managers  | npm, pnpm 11, Yarn 4, and Bun 1                                                                                                                                   |
| Bundlers          | Vite 8, webpack 5, esbuild, Angular build, Ember's Embroider/Vite pipeline, and Expo Metro                                                                        |
| Frameworks        | React 19, Vue 3, Svelte 5, Angular 22, Ember 7, Next.js 16 client/server, Nuxt 4 client/server, and Expo 57 web/React Native Android                              |
| Edge              | bundled SDK execution in Edge Runtime VM 5                                                                                                                        |
| Browser execution | Chromium, Firefox, and WebKit execution of constructors, exports, Fetch transport, authorization headers, resource serialization, and browser-only key validation |

Framework fixtures use Node 24.15 because current Angular requires Node 24.15 or newer. This does not change the SDK's separately tested Node 22.13 runtime floor.

The separate secret-gated live integration workflow installs the packed candidate and calls the read-only current-organization endpoint. It requires the `FLEETBASE_PUBLIC_KEY` repository secret for manual runs and never runs API mutations.
