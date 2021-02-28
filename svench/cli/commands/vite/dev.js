import relative from 'require-relative'

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

  configFile = 'vite.config.js',
  // sveltePlugin: sveltePluginName = 'rollup-plugin-svelte',

  override = {}, // legacy, deprecated, use named sub (i.e. vite)

  vite: customViteConfig = override,

  ...overrides
} = {}) => {
  const mode = 'development'
  const command = 'serve'

  const [{ createServer }, { svenchify }] = await Promise.all(
    ['vite', 'svench/vite'].map(async id => {
      const m = await import(relative.resolve(id, cwd))
      return m.default || m
    })
  )

  const svenchified = svenchify(configFile, {
    enabled: true,
    ...overrides,
  })

  const finalConfig = await resolveViteConfig(
    mergeViteConfigs(
      {
        configFile: false,
      },
      svenchified,
      customViteConfig
    ),
    { mode, command }
  )

  const server = await createServer(finalConfig)

  await server.listen()
}
