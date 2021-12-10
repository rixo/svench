import { load } from './util.js'

export default async (info, options) => {
  const mode = 'production'
  const command = 'build'

  const {
    vite: { build },
    config,
  } = await load({ mode, command }, info, options)

  if (options.minify === false) {
    config.build = { ...config.build, minify: false }
  }

  await build(config)
}
