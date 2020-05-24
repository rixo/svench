/* eslint-env node */
import addClasses from 'rehype-add-classes'
import { mdsvex } from 'mdsvex'
import postcss from 'rollup-plugin-postcss-hot'
import { svenchify } from 'svench/rollup'

export default svenchify('./rollup.config.js', {
  // The root dir that Svench will parse and watch.
  dir: './src',

  // Extensions Svench will process.
  // These extensions will also be appended to the svelte plugin.
  extensions: ['.svench', '.svench.svelte', '.svench.svx'],

  svelte: {
    preprocess: [
      mdsvex({
        extension: '.svx',
        rehypePlugins: [[addClasses, { '*': 'mdsvex' }]],
      }),
    ],
  },

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
      dir: 'public/svench',
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
        '<script defer type="module" src="/svench/svench.js">',
      'Svelte app': 'Svench app',
    },
    // write: 'public/svench/index.html',
  },

  serve: {
    host: '0.0.0.0',
    port: 4242,
    // public: ['.svench/build', 'public'],
    public: 'public',
  },
})
