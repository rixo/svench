import svelte from 'rollup-plugin-svelte-hot'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import css from 'rollup-plugin-css-only'
import nollupEsmHmr from 'rollup-plugin-hot-nollup'

const isWatch = !!process.env.ROLLUP_WATCH
const isNollup = !!process.env.NOLLUP
const isSvench = !!process.env.SVENCH

const production = !isWatch

const dev = !production
const hot = isWatch && dev

function serve() {
  let server

  function toExit() {
    if (server) server.kill(0)
  }

  return {
    writeBundle() {
      if (server) return
      server = require('child_process').spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        }
      )

      process.on('SIGTERM', toExit)
      process.on('exit', toExit)
    },
  }
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev,
      },
      hot,
      // NOTE Nollup currently has a problem resolving both build/bundle.js and
      //      build/bundle.css
      ...(isNollup && {
        emitCss: false,
      }),
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !isSvench && !isNollup && !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !isSvench && !hot && !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    // HMR compatibility layer for Nollup (import.meta.hot => module.hot)
    isNollup && nollupEsmHmr(),
  ],
  watch: {
    clearScreen: false,
  },
}
