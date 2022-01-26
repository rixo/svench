import chalk from 'chalk'

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

export default async (info, cliOptions) => {
  const mode = 'development'
  const command = 'serve'

  const {
    vite: { createServer },
    config,
  } = await load({ mode, command }, info, cliOptions)

  const server = await createServer(config)

  await server.listen()

  printWelcome(server, info.svench.version)
}
