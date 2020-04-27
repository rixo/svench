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

      // This example builds & run your app and Svench with in a single process
      //

      // NOTE we're _adding_ Svench entry to your existing one
      addInput: true,

      override: {
        output: {
          // output to dir instead of file
          file: null,
          dir: 'public/build',
          // we need an output format that supports multiple entry points
          format: 'es',
        },
      },

      index: {
        source: 'public/index.html',
        replace: {
          // NOTE we need type="module" since we're using ES format
          '<script defer src="/build/bundle.js">':
            '<script defer type="module" src="/build/svench.js">',
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
      },
    }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // NOTE with this example, your app and Svench runs simultaneously!
    dev && serve(),

    useLiveReload && livereload('public'),

    production && terser(),

    hmr({
      public: 'public',
      inMemory: true,
      compatModuleHot: !hot,
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
