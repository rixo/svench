import chalk from 'chalk'

import { loadSvelteConfig } from '../../lib.js'
import { load } from '../vite/util.js'

const printWelcome = (server, svenchVersion) => {
  const info = server.config.logger.info

  info(
    chalk.cyan(`\n  svench v${svenchVersion}`) +
      chalk.green(` (vite) dev server running at:\n`),
    {
      clear: !server.config.logger.hasWarned,
    }
  )

  server.printUrls()

  // eslint-disable-next-line no-console
  console.log('')
}

const resolveKitViteConfig = async ({ svelteConfig }) => {
  return svelteConfig?.kit?.vite || {}
}

export default async (info, cliOptions) => {
  const mode = 'development'
  const command = 'serve'

  const {
    vite: { createServer },
    config,
  } = await load({ mode, command }, info, {
    ...cliOptions,
    // NOTE this can't easily be resolved from preset, because we're riding over
    // Vite here, so Svenchify would try to load 'vite.config.js', which is not
    // really what we want with Kit
    resolveSourceConfig: resolveKitViteConfig,
    kit: true,
  })

  const server = await createServer(config)

  await server.listen()

  printWelcome(server, info.svench.version)
}
