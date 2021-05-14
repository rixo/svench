import { loadVite, loadSvenchifiedConfig } from './util.js'

export default async (info, options) => {
  const mode = 'production'
  const command = 'build'

  const { build } = await loadVite(info)

  const finalConfig = await loadSvenchifiedConfig(
    { mode, command },
    info,
    options
  )

  if (options.minify === false) {
    finalConfig.build = { ...finalConfig.build, minify: false }
  }

  await build(finalConfig)
}
