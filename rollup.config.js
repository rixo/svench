import * as path from 'path'
import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'
// import builtins from 'builtin-modules'

// NOTE The NOLLUP env variable is picked by various HMR plugins to switch
// in compat mode. You should not change its name (and set the env variable
// yourself if you launch nollup with custom comands).
const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const globals = {
  [path.resolve(__dirname, 'src/routify/index.js')]: 'Svench.routify',
}

export default {
  input: 'src/index.js',

  output: [
    // {
    //   sourcemap: true,
    //   format: 'iife',
    //   dir: './dist',
    //   name: 'Svench',
    //   globals,
    // },
    {
      sourcemap: true,
      format: 'esm',
      entryFileNames: '[name].esm.js',
      dir: './dist',
      globals,
    },
  ],

  external: ['./routify/index.js', '@sveltech/routify'],

  // external: [
  //   './components/State.svelte',
  //   './components/Group.svelte',
  //   ...builtins,
  // ],

  watch: {
    clearScreen: false,
  },

  plugins: [
    copy({
      targets: [{ src: 'src/routify', dest: 'dist' }],
    }),

    json(),

    svelte({
      // Enable run-time checks when not in production
      // dev: !production,
      // We'll extract any component CSS out into a separate file — better for
      // performance
      // NOTE extracting CSS doesn't work with HMR, so we're inlining when hot
      // ...(!hot && {
      //   css: css => {
      //     css.write('public/build/bundle.css')
      //   },
      // }),
      customElement: true,
      css: true,
      // tag: null,
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      // routify uses svelte
      mainFields: ['svelte', 'module', 'main'],
      browser: true,
      dedupe: ['svelte'],
      // preferBuiltins: true,
      // rollup-plugin-svelte-hot automatically resolves & dedup svelte
    }),
    commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
}
