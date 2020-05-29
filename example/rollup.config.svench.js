/* eslint-env node */
import postcss from 'rollup-plugin-postcss-hot'
import { svenchify } from 'svench/rollup'

export default svenchify('./rollup.config.js', {
  // The root dir that Svench will parse and watch.
  dir: './src',

  // Example: code splitting with ES modules
  override: {
    // replace input with a Svench entry point (here a custom one)
    input: '.svench/svench.js',

    output: {
      // change output format to ES module
      format: 'es',
      // remove the file from the original config (can't have file & dir)
      file: null,
      // and change to a dir (code splitting outputs multiple files)
      dir: '.svench/dist',
      // ensure we know the name of our entry point (useful when input file is
      // not named svench.js)
      entryFileNames: 'svench.js',
    },

    plugins: plugins => [...plugins, postcss()],
  },

  index: {
    source: 'public/index.html',
    // NOTE we need to add type="module" to use script in ES format
    replace: {
      '<script defer src="/build/bundle.js">':
        '<script defer type="module" src="/svench.js">',
      '"/build/bundle.css"': '/bundle.css',
      'Svelte app': 'Svench app',
    },
    // write: '.svench/dist/index.html',
  },

  serve: {
    host: '0.0.0.0',
    port: 4242,
    public: ['.svench/dist', 'public'],
    nollup: { port: 42421 },
  },
})
