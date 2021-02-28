/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: ['@snowpack/plugin-svelte', '@snowpack/plugin-dotenv'],
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
