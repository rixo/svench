import { loadVite, loadSvenchifiedConfig } from './util.js'

export default async (info, cliOptions) => {
  const mode = 'development'
  const command = 'serve'

  const { createServer } = await loadVite(info)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    info,
    cliOptions
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
