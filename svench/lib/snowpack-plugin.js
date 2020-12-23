import * as fs from 'fs'
import * as path from 'path'

import { createPluginParts } from './plugin-shared.js'
import { createIndex } from './template.js'
import { writeManifest } from './service-manifest.js'
import { mkdirp } from './util.js'
import { finalizeSnowpackOptions } from './snowpack-options.js'

const uniq = arr => [...new Set(arr)]

const loadConfig = () => {
  const svenchConfig = path.resolve('svench.config.js')
  if (!fs.existsSync(svenchConfig)) return {}
  return require.main.require(svenchConfig)
}

const resolveSveltePlugin = x =>
  typeof x === 'function' ? x : require.main.require(x)

const initSvench = ({ options, routix }) => async ({ isDev }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryFileName,
  } = options

  // --- Manifest ---

  const runManifest = async () => {
    if (!manifest) return
    await writeManifest(options)
  }

  // --- Index ---

  const runIndex = async () => {
    if (!indexCfg) return
    await createIndex(indexCfg, {
      watch: isDev,
      script: '/_svench_/' + entryFileName,
      publicDir,
    })
  }

  const startRoutix = async () => {
    await mkdirp(manifestDir)
    await routix.start({ watch: isDev })
    // await routix.onIdle(100) // report init errors
  }

  await Promise.all([runIndex(), runManifest(), startRoutix()])
}

const autoMount = ({ manifestDir, publicDir }, snowpackConfig) => {
  const { mount } = snowpackConfig

  const mountEntries = [[path.resolve(publicDir), { url: '/', static: true }]]

  let manifestDirEntry = [
    path.resolve(manifestDir),
    { url: '/_svench_', resolve: true, static: false },
  ]

  for (const [target, spec] of Object.entries(mount)) {
    if (manifestDirEntry && !spec.static) {
      mountEntries.push(manifestDirEntry)
      manifestDirEntry = null
    }
    mountEntries.push([target, spec])
  }

  if (manifestDirEntry) {
    mountEntries.push(manifestDirEntry)
  }

  return Object.fromEntries(mountEntries)
}

export const plugin = (snowpackConfig, pluginOptions = {}) => {
  const {
    svench: _legacySvenchUserOptions,
    svenchOptions: svenchUserOptions = _legacySvenchUserOptions,
    ...sveltePluginOptions
  } = pluginOptions

  const { sveltePlugin = '@snowpack/plugin-svelte', ...svenchOptions } = {
    ...loadConfig(),
    ...svenchUserOptions,
  }

  const _pluginSvelte = resolveSveltePlugin(sveltePlugin)

  let resolveRouteImport = x => x

  const parts = createPluginParts({
    ...svenchOptions,
    resolveRouteImport: (...args) => resolveRouteImport(...args),
    presets: 'svench/presets/snowpack',
    _finalizeOptions: finalizeSnowpackOptions,
  })

  // --- Guard: Svench disabled ---

  if (!parts.options.enabled) {
    return _pluginSvelte(snowpackConfig, sveltePluginOptions)
  }

  // --- Svench enabled ---

  const {
    options: { dir, port, extensions, override },
  } = parts

  sveltePluginOptions.preprocess = {
    markup: parts.preprocess.pull,
  }

  if (port) {
    snowpackConfig.devOptions = {
      ...snowpackConfig.devOptions,
      port,
    }
  }

  if (override) {
    const { mount, ...others } = override

    if (mount === true) {
      snowpackConfig.mount = autoMount(parts.options, snowpackConfig)
    } else if (mount) {
      snowpackConfig.mount = mount
    }

    for (const [key, value] of Object.entries(others)) {
      if (key.endsWith('Options')) {
        snowpackConfig[key] = { ...snowpackConfig[key], ...value }
      } else {
        snowpackConfig[key] = value
      }
    }
  }

  const distDir = path.resolve(dir)
  const mountEntry = snowpackConfig.mount[distDir]
  if (mountEntry) {
    const { url } = mountEntry
    resolveRouteImport = x => url + '/' + path.relative(distDir, x)
  }

  const hooks = _pluginSvelte(snowpackConfig, sveltePluginOptions)

  hooks.resolve.input = uniq([
    ...hooks.resolve.input,
    ...extensions.map(x => '.' + x.split('.').pop()),
  ])

  hooks.knownEntrypoints = uniq([
    ...hooks.knownEntrypoints,
    'svench',
    // TODO only if enabled in manifest:
    'svench/src/app/index.js',
    'svench/themes/default.css',
    'svench/themes/default-markdown.css',
  ])

  return {
    ...hooks,
    name: '@svench/snowpack',
    run: initSvench(parts),
  }
}

export default plugin

export { default as svenchify } from './snowpack-svenchify.js'
