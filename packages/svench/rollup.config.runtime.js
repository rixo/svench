/**
 * Rollup config to build (precompile) Svench's runtime.
 *
 * It was initially planned to make this module also expose a proper Rollup
 * config but, for now, that won't be the case (use `svench --raw` for dev).
 */

import fs from 'fs'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import svelte from 'rollup-plugin-svelte-hot'

const readJsonFile = (file, encoding = 'utf8') =>
  JSON.parse(fs.readFileSync(file, encoding))

export const makeSvenchConfig = (
  target,
  {
    getRuntimeFilename,
    svenchVersion = readJsonFile('./package.json').version,
    svelteCompiler,
    svelteVersion = svelteCompiler && svelteCompiler.VERSION,
    minify = !process.env.ROLLUP_WATCH,
    prod,
  }
) => {
  const targets = {
    svench: 'src/index.js',
    app: 'src/app/index.js',
  }

  const inputs = Object.entries(targets).filter(([_target]) =>
    Array.isArray(target) ? target.includes(_target) : target === _target
  )

  const modes =
    prod === false ? ['dev'] : prod === true ? ['prod'] : ['dev', 'prod']

  return inputs.flatMap(([name, input]) =>
    modes.map(mode => ({
      input,
      output: {
        format: 'es',
        file: getRuntimeFilename(name, {
          svenchVersion,
          svelteVersion,
          mode,
        }),
      },
      external: [/^svelte(\/|$)/],
      plugins: [
        svelte({
          // Svench core components are not supposed to have CSS -- the few that
          // there may be is probably supposed to be builtin (or properly
          // extracted when things settle)
          emitCss: false,
          compilerOptions: { dev: mode === 'dev' },
          hot: false,
          // NOTE special support from rollup-plugin-svelte-hot@1.0.0-8
          svelte: svelteCompiler,
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
  )
}
