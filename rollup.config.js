import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'
import builtins from 'builtin-modules'

export default [
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
  {
    input: 'src/prism.js',
    output: {
      format: 'iife',
      file: 'prism.js',
      name: 'SvenchPrism',
    },
    plugins: [
      postcss({
        // extract: 'prism.css',
      }),
      resolve({
        mainFields: ['svelte', 'module', 'main'],
        browser: true,
        dedupe: ['svelte'],
      }),
      commonjs(),
    ],
  },
]
