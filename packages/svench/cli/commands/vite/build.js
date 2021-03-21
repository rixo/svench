import { loadVite, loadSvenchifiedConfig } from './util.js'

export default async (info, cliOptions) => {
  const mode = 'production'
  const command = 'build'

  const { build } = await loadVite(info)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    info,
    cliOptions
  )

  await build(finalConfig)
}
