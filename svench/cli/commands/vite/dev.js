import { resolve } from '../../lib.js'

import { loadSvenchifiedConfig } from './util.js'

export default async (info, { cwd = process.cwd(), ...cliOptions }) => {
  const mode = 'development'
  const command = 'serve'

  const vitePath = await resolve('vite', cwd)
  const { createServer } = await import(vitePath)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    info,
    cliOptions
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
