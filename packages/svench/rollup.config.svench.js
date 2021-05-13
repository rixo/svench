import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'
import sveltePkg from 'svelte/package.json'

export const makeSvenchConfig = ({ svelte, minify, file }) =>
  [true, false].map(dev => ({
    input: 'src/index.js',
    output: {
      format: 'es',
      file: file(dev ? 'dev' : 'prod'),
    },
    external: [/^svelte(\/|$)/],
    plugins: [
      svelte({
        // Svench core components are not supposed to have CSS -- the few that
        // there may be is probably supposed to be builtin (or properly
        // extracted when things settle)
        emitCss: false,
        compilerOptions: { dev },
        hot: false,
      }),
      resolve({
        mainFields: ['svelte', 'module', 'main'],
        browser: true,
        dedupe: importee =>
          importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),
      minify && terser(),
    ],
  }))

export default async () => {
  const { default: svelte } = await import('rollup-plugin-svelte-hot')
  return makeSvenchConfig({
    file: mode =>
      `runtime/svench-${pkg.version}_${sveltePkg.version}_${mode}.js`,
    minify: !process.env.ROLLUP_WATCH,
    svelte,
  })
}
