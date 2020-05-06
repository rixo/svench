import * as path from 'path'
import * as fs from 'fs'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'
import builtins from 'builtin-modules'
import svelte from 'rollup-plugin-svelte-hot'

const production = !process.env.ROLLUP_WATCH
// const hot = !production

export default [
  // {
  //   input: 'src/app.ce/index.js',
  //   output: {
  //     format: 'iife',
  //     file: 'dist/app.js',
  //     sourcemap: true,
  //   },
  //   plugins: [
  //     svelte({
  //       // dev: !production,
  //       // css: css => {
  //       //   css.write('public/build/bundle.css')
  //       // },
  //       extensions: ['.svelte'],
  //       customElement: true,
  //       // preprocess,
  //       hot: hot && {
  //         optimistic: true,
  //         noPreserveState: false,
  //       },
  //     }),
  //
  //     resolve({
  //       browser: true,
  //       dedupe: ['svelte'],
  //     }),
  //
  //     commonjs(),
  //     // production && terser(),
  //   ],
  // },

  {
    input: 'src/app/index.js',
    output: {
      format: 'es',
      file: 'app.js',
      footer: "export { default as css } from './app.css.js';",
    },
    plugins: [
      svelte({
        // dev: !production,
        css: css => {
          css.write('app.css', false)
        },
        extensions: ['.svelte'],
        // hot: hot && {
        //   optimistic: true,
        //   noPreserveState: false,
        // },
      }),
      postcss({
        extract: 'app.vendor.css',
      }),
      resolve({
        mainFields: ['svelte', 'module', 'main'],
        browser: true,
        // dedupe: ['svelte', 'svelte/internal'],
        dedupe: importee =>
          importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),
      {
        async writeBundle() {
          const sources = ['app.css', 'app.vendor.css'].map(x =>
            path.resolve(__dirname, x)
          )
          const dest = path.resolve(__dirname, 'app.css.js')
          const css = (
            await Promise.all(sources.map(x => fs.promises.readFile(x, 'utf8')))
          ).join('\n')
          const js = `export default ${JSON.stringify(css)}`
          await fs.promises.writeFile(dest, js, 'utf8')
        },
      },
    ],
  },

  {
    input: 'src/app/prism.js',
    output: {
      format: 'iife',
      file: 'prism.js',
      name: 'SvenchPrismWithCss',
    },
    plugins: [postcss({}), resolve({ browser: true }), commonjs()],
  },

  {
    input: 'lib/rollup-plugin.js',
    output: {
      format: 'cjs',
      file: 'rollup.js',
      sourcemap: true,
    },
    external: builtins,
    plugins: [
      json(), // required by express
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
    ],
  },
]
