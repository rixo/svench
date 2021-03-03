import path from 'path'

import Log from './log.js'
import { createPluginParts } from './plugin-shared.js'
import { createIndex } from './template.js'
import { writeManifest } from './service-manifest.js'
import { pipe, mkdirp } from './util.js'
import { VITE_PLUGIN_NAME } from './const.js'
import { maybeDump } from './dump.js'
import { importDefaultRelative } from './import-relative.cjs'
import Svenchify from './svenchify.js'

const defaultPresets = ['svench/presets/vite']

const isSveltePlugin = x =>
  (x && x.name === 'svelte') || /\bvite-plugin-svelte\b/.test(x.name)

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
    const script = '/' + path.relative(root, entryFile)
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
    options: { enabled, svenchDir: root, port, dump, vite = {} },
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
        ...vite,
        server: {
          port,
          ...vite.server,
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
  async (
    { plugins: [...plugins] = [], ...config },
    parts,
    { wrapSvelteConfig }
  ) => {
    const {
      options: {
        defaultSveltePlugin,
        sveltePlugin = defaultSveltePlugin,
        svelte = {},
        vite: { clearScreen = config.clearScreen, server } = {},
      },
    } = parts

    const hasSveltePlugin = plugins.some(isSveltePlugin)
    if (!hasSveltePlugin) {
      Log.info('Inject svelte plugin: %s', sveltePlugin)
      const plugin = await importDefaultRelative(sveltePlugin)
      plugins.unshift(plugin(wrapSvelteConfig(svelte)))
    }

    const svenchPlugin = createPlugin(parts)
    plugins.unshift(svenchPlugin)

    return {
      ...config,
      plugins,
      clearScreen,
      server: {
        ...config.server,
        ...server,
      },
    }
  },
  getConfig => getConfig
)
