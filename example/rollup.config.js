import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import hmr from 'rollup-plugin-hot'
// import { svenchify } from 'svench/rollup'

const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const hot = watch && !useLiveReload
const isSvench = !!process.env.SVENCH

const spa = true

export default {
  input: 'src/main.js',

  output: {
    sourcemap: true,
    format: 'iife',
    file: 'public/build/bundle.js',
    name: 'app',
  },

  plugins: [
    // svenchify.svelte(svelte, {
    svelte({
      dev: !production,
      css: css => {
        css.write('public/build/bundle.css')
      },
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

    !isSvench && dev && serve(),

    useLiveReload && livereload('public'),

    hmr({
      public: 'public',
      inMemory: true,
      compatModuleHot: !hot, // for terser
    }),

    production && terser(),
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
