import fs from 'fs'
import path from 'path'

import { resolve, importAbsolute } from '../../lib.js'

export default async (
  _,
  { cwd = process.cwd(), reload, ...overrides } = {}
) => {
  const rel = async x => {
    const file = await resolve(x, cwd)
    return await importAbsolute(file)
  }

  const { startDevServer, createConfiguration } = await rel('snowpack')
  const { svenchify } = await rel('svench/snowpack')

  const defaultConfigFile = path.resolve(cwd, 'snowpack.config.js')

  const original = fs.existsSync(defaultConfigFile)
    ? (await importAbsolute(defaultConfigFile)).default
    : {}

  const svenchified = svenchify(original, {
    enabled: true,
    sveltePlugin: await rel('@snowpack/plugin-svelte'),
    ...overrides,
  })

  // TODO what does this function returns??
  const [, config] = createConfiguration(svenchified)

  if (reload) {
    await rel('snowpack/lib/util').clearCache()
  }

  await startDevServer({ cwd, config })
}
