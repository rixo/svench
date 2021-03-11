import relative from 'require-relative'

import { loadSvenchifiedConfig } from './util.js'

export default async (
  options, { cwd = process.cwd(), ...cliOptions }
) => {
  const mode = 'development'
  const command = 'serve'

  const { createServer } = await import(relative.resolve('vite', cwd))

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    options,
    cliOptions
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
