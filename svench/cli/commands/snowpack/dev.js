import fs from 'fs'
import path from 'path'
import relative from 'require-relative'

export default async ({ cwd = process.cwd(), reload, ...overrides } = {}) => {
  const rel = x => relative(x, cwd)

  const { startDevServer, createConfiguration } = rel('snowpack')
  const { svenchify } = rel('svench/snowpack')

  const defaultConfigFile = path.resolve(cwd, 'snowpack.config.js')

  const original = fs.existsSync(defaultConfigFile)
    ? (await import(defaultConfigFile)).default
    : {}

  const svenchified = svenchify(original, {
    enabled: true,
    sveltePlugin: rel('@snowpack/plugin-svelte'),
    ...overrides,
  })

  // TODO what does this function returns??
  const [, config] = createConfiguration(svenchified)

  if (reload) {
    await rel('snowpack/lib/util').clearCache()
  }

  await startDevServer({ cwd, config })
}
