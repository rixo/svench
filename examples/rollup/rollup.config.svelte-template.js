import _svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import hmr from 'rollup-plugin-hot'
// import { mdsvex } from 'mdsvex'
import { withSvench } from 'svench/rollup'

const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const hot = watch && !useLiveReload
const isSvench = !!process.env.SVENCH

const spa = true

const preprocess = [
  // mdsvex({
  //   extension: '.svx',
  // }),
]

// NOTE this will do nothing and just return the Svelte plugin you've passed
// in, if not enabled (based on process.env.SVENCH being set, by default)
const svelte = withSvench(_svelte, {
  // The root dir that Svench will parse and watch.
  dir: './src',

  // The Svench plugins does some code transform, and so it needs to know of
  // your preprocessors to be able to parse your local Svelte variant.
  preprocess,

  extensions: ['.svench', '.svench.svelte', '.svench.svx'],

  svelte: {
    css: true, // CSS in JS
  },

  // This example writes Svench to a single iife file
  rollup: {
    // replace your entry with Svench's one
    input: true,
    // inlining `import(...)` from Svench's codebase is required for iife
    inlineDynamicImports: true,
    // output to another file
    output: {
      file: 'public/build/svench.js',
    },
  },

  index: {
    source: 'public/index.html',
    replace: {
      '/build/bundle.js': '/build/svench.js',
      'Svelte app': 'Svench app',
    },
    write: 'public/svench.html',
  },

  serve: {
    host: '0.0.0.0',
    port: 4242,
    public: 'public',
  },
})

export default {
  input: 'src/main.js',

  output: {
    sourcemap: true,
    format: 'iife',
    file: 'public/build/bundle.js',
    name: 'app',
  },

  plugins: [
    svelte({
      css: css => {
        css.write('public/build/bundle.css')
      },
      extensions: ['.svelte', '.svench', '.svx'],
      hot: true,
    }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // NOTE with this config, we're using separate rollup processes (and so we
    // don't want to run your server and Svench's server simultaneously)
    !isSvench && dev && serve(),

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
