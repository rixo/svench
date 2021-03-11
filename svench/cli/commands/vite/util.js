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

export const loadSvenchifiedConfig = async (
  { mode, command },
  { vite: { sveltePlugin: defaultSveltePlugin = 'rollup-plugin-svelte-hot' } },
  {
    vite: configFile = 'vite.config.js',
    override: configOverride,
    nocfg = false,
    sveltePlugin,
    ...cliOverrides
  } = {}
) => {
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
    // enforce hot mode (@svitejs/vite-plugin-svelte doesn't do auto hot)
    forceSvelteHot: true,
    ...cliOverrides,
  })

  return await resolveViteConfig(
    mergeViteConfigs({ configFile: false }, svenchified),
    { mode, command }
  )
}
