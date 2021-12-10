import sirv from 'sirv'

import { createPluginParts } from './plugin-shared.js'
import { createIndex } from './template.js'
import { writeManifest } from './service-manifest.js'
import { pipe, mkdirp } from './util.js'
import { VITE_PLUGIN_NAME } from './const.js'
import { maybeDump } from './dump.js'
import injectTransform from './transform.js'
import Svenchify from './svenchify.js'
import { indexHtmlMiddleware } from './vite-plugin-middlewares.js'

const defaultPresets = ['svench/presets/vite']

const initSvench = async ({ options, routix }, { command }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryUrl,
    svenchIcon,
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
      svenchIcon,
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
    options: {
      enabled,
      dump,
      vite = {},
      svenchDir,
      viteImports: { send },
    },
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

    configureServer(server) {
      server.middlewares.use(
        sirv(svenchDir, {
          dev: true,
          etag: true,
          extensions: [],
          setHeaders(res, pathname) {
            // Matches js, jsx, ts, tsx.
            // The reason this is done, is that the .ts file extension is reserved
            // for the MIME type video/mp2t. In almost all cases, we can expect
            // these files to be TypeScript files, and for Vite to serve them with
            // this Content-Type.
            if (/\.[tj]sx?$/.test(pathname)) {
              res.setHeader('Content-Type', 'application/javascript')
            }
          },
        })
      )
      return () => {
        server.middlewares.use(indexHtmlMiddleware(server, { svenchDir, send }))
      }
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
