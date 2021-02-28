const path = require('path')

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    '.svench/public': { url: '/', static: true },
    public: { url: '/', static: true },
    '.svench/src': { url: '/_svench_' },
    src: { url: '/dist' },
  },
  plugins: [
    [
      'svench/snowpack',
      {
        enabled: true,
        svelte: {
          emitCss: false, // CSS in JS
        },
        // The root dir that Svench will parse and watch.
        dir: './src',
        resolveRouteImport: x => '/dist/' + path.relative('src', x),
        index: {
          source: 'public/index.html',
          replace: {
            '/dist/index.js': '/_svench_/svench.js',
            'Snowpack App': 'Svench app',
          },
          write: true,
        },
      },
    ],
    '@snowpack/plugin-dotenv',
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    // NOTE this is needed when svench is symlinked into the example (i.e.
    // for Svench dev itself)
    rollup: {
      dedupe: ['svelte', 'svelte/internal'],
    },
  },
  devOptions: {
    open: 'none',
    output: 'stream',
    port: 4242,
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
}
