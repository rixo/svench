import { svenchify } from '../../../lib/vite-plugin.js'
import { Log } from '../../lib.js'

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

export const loadVite = async info => {
  if (!info.vite || !info.vite.vitePath) {
    throw new Error('Failed to find Vite')
  }
  if (!info.vite.sveltePluginPath) {
    throw new Error('Failed to find Svelte plugin for Vite')
  }
  return await import(info.vite.vitePath)
}

export const loadSvenchifiedConfig = async (
  { mode, command },
  info,
  {
    vite: configFile = 'vite.config.js',
    override: configOverride,
    nocfg = false,
    ...cliOverrides
  } = {}
) => {
  if (info.missingDeps.length > 0) {
    Log.error('Missing dependencies: %s', info.missingDeps.join(', '))
    process.exit(255)
  }

  const {
    standalone,
    app: { type },
    vite: { sveltePlugin: defaultSveltePlugin = 'rollup-plugin-svelte-hot' },
    svench: { dir: svenchPath },
    svelte: { dir: sveltePath, compiler: svelteCompiler } = {},
  } = info

  const source = nocfg
    ? {}
    : configFile === true
    ? 'vite.config.js'
    : configFile

  const svenchified = svenchify(source, {
    enabled: true,

    standalone,
    svenchPath,
    sveltePath,
    svelteCompiler,

    vite: configOverride || true,
    isModule: type === 'module',
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
