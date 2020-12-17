import * as fs from 'fs'
import * as path from 'path'

import { createPluginParts } from './plugin-shared'
import { createIndex } from './template'

const uniq = arr => [...new Set(arr)]

const loadConfig = () => {
  const svenchConfig = path.resolve('svench.config.js')
  if (!fs.existsSync(svenchConfig)) return {}
  return require(svenchConfig)
}

const resolveSveltePlugin = x => (typeof x === 'function' ? x : require(x))

const initSvench = async (
  // config
  { options: { index: indexCfg } },
  // options
  { isDev }
) => {
  // --- Index ---

  if (indexCfg) {
    await createIndex(indexCfg, { watch: isDev })
  }
}

export const plugin = (snowpackConfig, pluginOptions = {}) => {
  // console.log(snowpackConfig)
  // process.exit()

  const { svench: svenchUserOptions, ...sveltePluginOptions } = pluginOptions

  const {
    sveltePlugin = require('@snowpack/plugin-svelte'),
    ...svenchOptions
  } = {
    ...loadConfig(),
    ...svenchUserOptions,
  }

  const _pluginSvelte = resolveSveltePlugin(sveltePlugin)

  const parts = createPluginParts({
    ...svenchOptions,
  })

  // --- Guard: Svench disabled ---

  if (!parts.options.enabled) {
    return _pluginSvelte(snowpackConfig, sveltePluginOptions)
  }

  // --- Svench enabled ---

  const { extensions, override } = parts.options

  sveltePluginOptions.preprocess = {
    markup: parts.preprocess.pull,
  }

  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (key.endsWith('Options')) {
        snowpackConfig[key] = { ...snowpackConfig[key], ...value }
      } else {
        snowpackConfig[key] = value
      }
    }
  }

  const hooks = _pluginSvelte(snowpackConfig, sveltePluginOptions)

  hooks.resolve.input = uniq(
    [...hooks.resolve.input, ...extensions].map(x => '.' + x.split('.').pop())
  )

  hooks.knownEntrypoints = uniq([
    ...hooks.knownEntrypoints,
    // 'svench',
    'svench/svench.js',
    'svench/src/index.js',
  ])

  return {
    ...hooks,

    name: '@svench/snowpack',

    async run({ isDev }) {
      await Promise.all([
        parts.routix.start({ watch: isDev }),
        initSvench(parts, { isDev }),
      ])
    },
  }
}

export default plugin

export { default as svenchify } from './snowpack-svenchify.js'
