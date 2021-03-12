import { resolve } from '../../lib.js'

import { loadSvenchifiedConfig } from './util.js'

export default async (options, { cwd = process.cwd(), ...cliOptions }) => {
  const mode = 'production'
  const command = 'build'

  const vitePath = await resolve('vite', cwd)
  const { build } = await import(vitePath)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    options,
    cliOptions
  )

  await build(finalConfig)
}
