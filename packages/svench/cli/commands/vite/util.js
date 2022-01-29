import { svenchify } from '../../../lib/vite-plugin.js'
import { Log, importAbsolute } from '../../lib.js'

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
  return await importAbsolute(info.vite.vitePath)
}

export const load = async ({ mode, command }, info, options) => {
  const vite = await loadVite(info)

  const { send, searchForWorkspaceRoot } = vite

  const config = await loadSvenchifiedConfig({ mode, command }, info, {
    ...options,
    viteImports: { send, searchForWorkspaceRoot },
  })

  return { vite, config }
}

const resolveViteSourceConfig = ({ vite: configFile = 'vite.config.js' }) => {
  return configFile === true ? 'vite.config.js' : configFile
}

export const loadSvenchifiedConfig = async (
  { mode, command },
  info,
  options = {}
) => {
  const {
    // allow custom vite config resolution (for Kit, from kit.vite in
    // svelte.config.js)
    resolveSourceConfig = resolveViteSourceConfig,
    override: configOverride,
    nocfg = false,
    ...cliOverrides
  } = options

  if (info.missingDeps.length > 0) {
    Log.error('Missing dependencies: %s', info.missingDeps.join(', '))
    process.exit(255)
  }

  const {
    standalone,
    app: { type },
    vite: { sveltePluginPath },
    svench: { dir: svenchPath, version: svenchVersion },
    svelte: {
      dir: sveltePath,
      compiler: svelteCompiler,
      version: svelteVersion,
    } = {},
  } = info

  const source = nocfg ? {} : await resolveSourceConfig(options)

  const svenchified = svenchify(source, {
    enabled: true,

    standalone,
    svenchPath,
    svenchVersion,
    sveltePath,
    svelteCompiler,
    svelteVersion,
    sveltePlugin: sveltePluginPath,

    vite: configOverride || true,
    isModule: type === 'module',
    // enforce hot mode (@svitejs/vite-plugin-svelte doesn't do auto hot)
    forceSvelteHot: true,
    ...cliOverrides,
  })

  return await resolveViteConfig(
    mergeViteConfigs({ configFile: false }, svenchified),
    { mode, command }
  )
}
