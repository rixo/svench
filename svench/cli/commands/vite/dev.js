import { loadSvenchifiedConfig } from './util.js'

export default async (info, cliOptions) => {
  if (!info.vite || !info.vite.vitePath) {
    throw new Error('Failed to find Vite')
  }
  if (!info.vite.sveltePluginPath) {
    throw new Error('Failed to find Svelte plugin for Vite')
  }

  const mode = 'development'
  const command = 'serve'

  const { createServer } = await import(info.vite.vitePath)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    info,
    cliOptions
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
