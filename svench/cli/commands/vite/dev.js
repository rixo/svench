import relative from 'require-relative'
import { svenchify } from '../../../lib/vite-plugin.js'

const resolveViteConfig = async (source, args = {}) => {
  const resolved = await source
  return typeof resolved === 'function'
    ? resolveViteConfig(resolved(args))
    : resolved
}

const mergeConfigs = subs => (...configs) => async (...args) => {
  const result = {}
  for (const sourceConfig of configs) {
    const config = await resolveViteConfig(sourceConfig, args)
    for (const [key, value] of Object.entries(config)) {
      if (subs.includes(key)) {
        result[key] = {
          ...result[key],
          ...value,
        }
      } else {
        result[key] = value
      }
    }
  }
  return result
}

const mergeViteConfigs = mergeConfigs([
  'resolve',
  'css',
  'json',
  'server',
  'build',
  'optimizeDeps',
  'ssr',
])

export default async (
  { vite: { sveltePlugin: defaultSveltePlugin = 'rollup-plugin-svelte-hot' } },
  {
    cwd = process.cwd(),
    vite: configFile = 'vite.config.js',
    override: configOverride,
    nocfg = false,
    sveltePlugin,
    ...cliOverrides
  } = {}
) => {
  const mode = 'development'
  const command = 'serve'

  const { createServer } = await import(relative.resolve('vite', cwd))

  const source = nocfg
    ? {}
    : configFile === true
    ? 'vite.config.js'
    : configFile

  const svenchified = svenchify(source, {
    enabled: true,
    vite: configOverride || true,
    sveltePlugin,
    defaultSveltePlugin,
    ...cliOverrides,
  })

  const finalConfig = await resolveViteConfig(
    mergeViteConfigs({ configFile: false }, svenchified),
    { mode, command }
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
