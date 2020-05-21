import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import hmr from 'rollup-plugin-hot'
import { mdsvex } from 'mdsvex'
import svench from 'svench/rollup'

const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const hot = watch && !useLiveReload
const isSvench = !!process.env.SVENCH

const spa = true

const preprocess = [
  mdsvex({
    extension: '.svx',
  }),
]

export default {
  input: 'src/main.js',

  output: {
    sourcemap: true,
    format: 'iife',
    file: 'public/build/bundle.js',
    name: 'app',
  },

  plugins: [
    svench({
      // The root dir that Svench will parse and watch.
      dir: './src',

      // The Svench plugins does some code transform, and so it needs to know of
      // your preprocessors to be able to parse your local Svelte variant.
      preprocess,

      extensions: ['.svench', '.svench.svelte', '.svench.svx'],

      // Example: code splitting with ES modules
      override: {
        // replace your entry with Svench's one
        // input: svench.entry.shadowLight,
        input: true,
        output: {
          // change output format to ES module
          format: 'es',
          // remove the file from the original config (can't have file & dir)
          file: null,
          // and change to a dir (code splitting outputs multiple files)
          dir: 'public/svench',
          entryFileNames: 'svench.js',
        },
      },

      index: {
        source: 'public/index.html',
        // NOTE we need to add type="module" to use script in ES format
        replace: {
          '<script defer src="/build/bundle.js">':
            '<script defer type="module" src="/svench/svench.js">',
          'Svelte app': 'Svench app',
        },
        write: 'public/svench.html',
      },

      serve: {
        host: '0.0.0.0',
        port: 4242,
        public: 'public',
      },
    }),

    svelte({
      dev: !production,
      css: css => {
        css.write('public/build/bundle.css')
      },
      extensions: ['.svelte', '.svench', '.svx', '.svhx'],
      preprocess,
      hot: hot && {
        optimistic: true,
        noPreserveState: false,
        // noDisableCss: true,
      },
    }),

    resolve({
      browser: true,
      // dedupe: ['svelte', 'svelte/internal'],
      dedupe: importee =>
        importee === 'svelte' || importee.startsWith('svelte/'),
    }),
    commonjs(),

    // NOTE with this config, we're using separate rollup processes
    !isSvench && dev && serve(),

    useLiveReload && livereload('public'),

    production && terser(),

    hmr({
      public: 'public',
      inMemory: true,
      compatModuleHot: !hot, // for terser
    }),
  ],
  watch: {
    clearScreen: false,
  },
}

function serve() {
  let started = false
  return {
    name: 'svelte/template:serve',
    writeBundle() {
      if (!started) {
        started = true
        const flags = ['run', 'start', '--', '--dev']
        if (spa) {
          flags.push('--single')
        }
        require('child_process').spawn('npm', flags, {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}
