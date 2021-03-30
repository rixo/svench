import { createPluginParts } from './plugin-shared.js'
import { createIndex } from './template.js'
import { writeManifest } from './service-manifest.js'
import { pipe, mkdirp } from './util.js'
import { VITE_PLUGIN_NAME } from './const.js'
import { maybeDump } from './dump.js'
import injectTransform from './transform.js'
import Svenchify from './svenchify.js'

const defaultPresets = ['svench/presets/vite']

const initSvench = async ({ options, routix }, { command }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryUrl,
  } = options

  const watch = command === 'serve'

  const runManifest = async () => {
    if (!manifest) return
    await writeManifest(options)
  }

  const runIndex = async () => {
    if (!indexCfg) return
    await createIndex(indexCfg, {
      watch,
      script: entryUrl,
      publicDir,
    })
  }

  const startRoutix = async () => {
    await mkdirp(manifestDir)
    await routix.start({ watch })
    await routix.onIdle(100) // report init errors
  }

  await Promise.all([runIndex(), runManifest(), startRoutix()])
}

const createPlugin = parts => {
  const {
    options,
    options: { enabled, dump, vite = {} },
  } = parts

  maybeDump('options', dump, options)

  if (!enabled) {
    return { name: `${VITE_PLUGIN_NAME}:disabled` }
  }

  let commandContext

  return {
    name: VITE_PLUGIN_NAME,

    config(config, ctx) {
      commandContext = ctx
      return vite
    },

    configResolved(config) {
      maybeDump('config', dump, config)
    },

    async options(options) {
      await initSvench(parts, commandContext)
      return options
    },
  }
}

const svenchVitePlugin = pipe(
  options => ({ presets: defaultPresets, ...options }),
  createPluginParts,
  createPlugin
)

export default svenchVitePlugin

export const svenchify = Svenchify(
  defaultPresets,
  async ({ plugins = [], ...config }, parts) => {
    const {
      routix,
      options: { extensions, vite: { clearScreen = config.clearScreen } = {} },
    } = parts

    const svenchPlugin = createPlugin(parts)

    return injectTransform({
      extensions,
      routix,
      // NOTE current Vite plugins are enforce 'pre', so let's follow them...
      enforce: 'pre',
    })({
      ...config,
      plugins: [svenchPlugin, ...plugins],
      clearScreen,
    })
  }
)
