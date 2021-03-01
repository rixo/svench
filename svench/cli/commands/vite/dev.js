import relative from 'require-relative'
// import { svenchify } from '../../../vite'
import { svenchify } from '../../../lib/vite-plugin'

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

export default async ({
  cwd = process.cwd(),
  vite: configFile = 'vite.config.js',
  override: configOverride,
  nocfg = false,
  sveltePlugin = 'rollup-plugin-svelte-hot',
  ...overrides
} = {}) => {
  const mode = 'development'
  const command = 'serve'

  const [
    { createServer },
    { default: sveltePluginFactory } = {},
  ] = await Promise.all(
    ['vite', sveltePlugin].map(
      async id => id && (await import(relative.resolve(id, cwd)))
    )
  )

  const source = nocfg
    ? {}
    : configFile === true
    ? 'vite.config.js'
    : configFile

  const svenchified = svenchify(source, {
    enabled: true,
    vite: configOverride || true,
    sveltePlugin: sveltePluginFactory,
    ...overrides,
  })

  const finalConfig = await resolveViteConfig(
    mergeViteConfigs({ configFile: false }, svenchified),
    { mode, command }
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
