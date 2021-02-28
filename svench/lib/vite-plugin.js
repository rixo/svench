import path from 'path'

import { createPluginParts } from './plugin-shared.js'
import { createIndex } from './template.js'
import { writeManifest } from './service-manifest.js'
import { pipe, mkdirp } from './util.js'
import { VITE_PLUGIN_NAME } from './const.js'
import { maybeDump } from './dump.js'
import Svenchify from './svenchify.js'

const defaultPresets = ['svench/presets/vite']

const runtimeDeps = [
  'navaid',
  'overlayscrollbars',
  'zingtouch/src/ZingTouch.js',
  'regexparam',
]

const initSvench = async ({ options, routix }, { isDev, root }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryFile,
  } = options

  const runManifest = async () => {
    if (!manifest) return
    await writeManifest(options)
  }

  const runIndex = async () => {
    if (!indexCfg) return
    const script = './' + path.relative(root, entryFile)
    await createIndex(indexCfg, {
      watch: isDev,
      script,
      publicDir,
    })
  }

  const startRoutix = async () => {
    await mkdirp(manifestDir)
    await routix.start({ watch: isDev })
    await routix.onIdle(100) // report init errors
  }

  await Promise.all([runIndex(), runManifest(), startRoutix()])
}

const createPlugin = parts => {
  const {
    options,
    options: { enabled, svenchDir: root, port, dump },
  } = parts

  maybeDump('options', dump, options)

  if (!enabled) {
    return { name: `${VITE_PLUGIN_NAME}:disabled` }
  }

  let isDev

  return {
    name: VITE_PLUGIN_NAME,

    config(config, { mode }) {
      isDev = mode === 'development'
      return {
        root,
        optimizeDeps: {
          include: runtimeDeps,
        },
        server: {
          port,
        },
      }
    },

    configResolved(config) {
      maybeDump('config', dump, config)
    },

    async options() {
      await initSvench(parts, { isDev, root })
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
  ({ plugins, ...config }, parts) => {
    if (!plugins) {
      throw new Error('A Svelte plugin is required in your Vite plugins')
    }

    const svenchPlugin = createPlugin(parts)

    return {
      ...config,
      plugins: [svenchPlugin, ...plugins],
    }
  },
  getConfig => getConfig
)
