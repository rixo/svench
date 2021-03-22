/**
 * Standalone config: inject the Svench plugin and adjust Svelte & Rollup
 * configuration manually.
 *
 * Most appropriate for standalone Svench only (i.e. no main app) setups.
 */

import svelte from 'rollup-plugin-svelte-hot'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import css from 'rollup-plugin-css-only'
import nollupEsmHmr from 'rollup-plugin-hot-nollup'
import { svench } from 'svench/rollup.cjs'

process.env.SVENCH = true

const isWatch = !!process.env.ROLLUP_WATCH
const isNollup = !!process.env.NOLLUP
const isSvench = !!process.env.SVENCH

const production = !isWatch

const dev = !production
const hot = isWatch && dev

const extensions = ['.svelte', '.svench', '.md']

export default {
  input: '.svench/src/svench.js',
  output: {
    sourcemap: true,
    format: 'es',
    dir: '.svench/public/build',
  },
  plugins: [
    svench({ enabled: true }),

    svelte({
      extensions,
      compilerOptions: { dev },
      hot,
      emitCss: false,
    }),

    css({ output: 'bundle.css' }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    production && terser(),

    // HMR compatibility layer for Nollup (import.meta.hot => module.hot)
    isNollup && nollupEsmHmr(),
  ],
  watch: {
    clearScreen: false,
  },
}
