import { loadVite, loadSvenchifiedConfig } from './util.js'
import { Log } from '../../lib.js'

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
  
  Log.warn( 'Svench ready and listening at http://localhost:%s', server.config.server.port )

  await server.listen()
}
