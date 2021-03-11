import relative from 'require-relative'

import { loadSvenchifiedConfig } from './util.js'

export default async (options, { cwd = process.cwd(), ...cliOptions }) => {
  const mode = 'production'
  const command = 'build'

  const { build } = await import(relative.resolve('vite', cwd))

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    options,
    cliOptions
  )

  await build(finalConfig)
}
