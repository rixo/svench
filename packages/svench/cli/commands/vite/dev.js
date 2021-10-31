import chalk from 'chalk'

import { loadVite, loadSvenchifiedConfig } from './util.js'

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

  printWelcome(server, info.svench.version)
}
