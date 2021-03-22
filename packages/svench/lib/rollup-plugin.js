import * as path from 'path'
import * as fs from 'fs'
import { rollupPlugin as Routix } from 'routix'

import { tap, pipe, mkdirp } from './util.js'
import { maybeDump } from './dump.js'
import injectTransform from './transform.js'
import createServer from './server.js'
import { createIndex, _template } from './template.js'
import { writeManifestSync } from './service-manifest.js'
import Svenchify from './svenchify.js'
import { createPluginParts } from './plugin-shared.js'

import defaultPresets from '../presets/rollup.cjs'

const overrideInputOptions = ({ rollup, entryFile }) => original => {
  const options = { ...original }
  if (rollup) {
    // eslint-disable-next-line no-unused-vars
    const { output, ...inputOptions } = rollup
    Object.assign(options, inputOptions)
    if (options.input === true) {
      options.input = entryFile
    }
    // plugins
    if (rollup.plugins) {
      if (typeof rollup.plugins === 'function') {
        options.plugins = rollup.plugins(original.plugins)
      } else {
        options.plugins = [...original.plugins, ...rollup.plugins]
      }
    }
  }
  return options
}

let globalServer

const createPlugin = ({
  options,
  options: {
    enabled,
    watch,
    extensions,

    publicDir,
    entryFile,
    manifest,

    rollup = null,
    preserveOutputFileName = true,

    index: indexCfg,

    serve,
    isNollup,

    mountEntry,

    dump,
  },
  routix,
}) => {
  // NOTE if not enabled, routix & preprocess aren't instanciated
  if (!enabled) {
    return { name: 'svench (disabled)' }
  }

  if (manifest) {
    writeManifestSync(options)
  }

  let server

  if (globalServer) {
    globalServer.close()
  }
  if (serve) {
    server = createServer(serve, { mountEntry, isNollup })
    if (process.env.NODE_ENV !== 'test') {
      globalServer = server
    }
  }

  let hotPlugin

  const findHotPlugin = options => {
    hotPlugin = options.plugins.find(
      ({ name, _reload }) => name === 'hot' && _reload
    )
  }

  const hotReload = () => {
    if (!hotPlugin) return
    hotPlugin._reload({ reason: "Svench's index.html has changed" })
  }

  let started = false

  // TODO script resolution etc probably been broken by the big plugin refactor
  const start = async (outputOptions = {}) => {
    if (started) return

    started = true

    const { file, dir } = outputOptions

    const { input } = inputOptions
    const entryName = Array.isArray(input) ? input[input.length - 1] : input

    const publicDirsInput = !publicDir
      ? []
      : Array.isArray(publicDir)
      ? publicDir
      : [publicDir]

    // public dirs can be:
    //
    //     [
    //       'a_dir',
    //       { base: '/', dir: 'another_dir' },
    //     ]
    //
    const publicDirs = publicDirsInput.filter(Boolean).map(x => x.dir || x)

    const findRelative = file => {
      for (const dir of publicDirs) {
        const relative = path.relative(dir, file)
        if (!path.isAbsolute(relative) && !relative.startsWith('..')) {
          return relative
        }
      }
    }

    const entryFile = file
      ? path.resolve(file)
      : path.resolve(dir, path.basename(entryName))

    const entryPath = publicDirs.length > 0 && findRelative(entryFile)

    const script = entryPath ? '/' + entryPath.replace(/\\/g, '/') : mountEntry

    const getIndex = indexCfg
      ? indexCfg === true
        ? _template({ script })
        : await createIndex(indexCfg, {
            watch,
            script,
            onChange: hotReload,
            publicDir,
          })
      : null

    if (server) {
      server.start({ getIndex, entryFile, mountEntry })
    }
  }

  let originalInput
  let originalOutputFile
  let inputOptions

  const saveOriginalInput = options => {
    originalInput = options.input
  }

  const saveInputOptions = options => {
    inputOptions = options
  }

  return {
    ...Routix(routix),

    name: 'svench',

    options: pipe(
      tap(saveOriginalInput),
      tap(findHotPlugin),
      overrideInputOptions({ rollup, entryFile }),
      injectTransform({ extensions, routix }),
      tap(saveInputOptions),
      maybeDump('config', dump)
    ),

    outputOptions(outputOptions) {
      originalOutputFile = outputOptions.file
      return (rollup && rollup.output) || outputOptions
    },

    async generateBundle(outputOptions, bundle) {
      if (this.meta.rollupVersion.startsWith('1.')) {
        // bundle.outputOptions = outputOptions
        Object.defineProperty(bundle, '__$outputOptions', {
          enumerable: false,
          value: outputOptions,
        })
      }

      // NOTE writeBundle is not called when write is false (or Nollup), so we
      // need to start from generateBundle... (this has a risk of missing file,
      // though :/)
      await start(outputOptions).catch(err => {
        this.error(err)
      })
    },

    async writeBundle(outputOptions) {
      if (this.meta.rollupVersion.startsWith('1.')) {
        outputOptions = outputOptions['__$outputOptions']
      }

      const rewriteOutputFile = async () => {
        // case: user config has input:string and output.file
        //
        // we will change to output.dir, so Rollup will output the user's
        // original entry point to `[name].js` or the like... and so we need to
        // rename the produced file to what the user's system actually expects
        //
        // NOTE this can't be done via Rollup's ways, because we can't pass a
        // function to entryFileNames
        //
        if (!preserveOutputFileName) return
        if (Array.isArray(originalInput) || !Array.isArray(inputOptions.input))
          return
        if (!originalOutputFile || !outputOptions.dir) return
        const src = path.resolve(
          outputOptions.dir,
          path.basename(originalInput)
        )
        const dest = originalOutputFile
        await mkdirp(path.dirname(originalOutputFile))
        await fs.promises.rename(src, dest)
      }

      await rewriteOutputFile()

      // await start(outputOptions).catch(err => {
      //   this.error(err)
      // })
    },
  }
}

export const svench = pipe(
  options => ({ presets: defaultPresets, ...options }),
  createPluginParts,
  createPlugin
)

const SVENCH = Symbol('Svench')

// export const svenchify = Svenchify(createPlugin)
export const svenchify = Svenchify(
  defaultPresets,
  (config, parts, { wrapSvelteConfig }) => {
    const { options } = parts

    // NOTE this is not functionnaly necessary because this work is done by
    // the plugin anyway, however this helps with Rollup logs, or someone
    // dumping svenchified config for debug purpose
    if (options.rollup) {
      const { rollup } = options
      if (rollup.input) {
        config.input = rollup.input
      }
      if (rollup.output) {
        config.output = rollup.output
      }
    }

    if (!config.plugins) {
      throw new Error('A Svelte plugin is required in your Rollup config')
    }

    // TODO svenchify.svelte... probably not a keeper
    config.plugins = config.plugins.filter(Boolean).map(x => {
      if (!x[SVENCH]) return x
      const {
        [SVENCH]: { plugin, config },
      } = x
      return plugin(wrapSvelteConfig(config))
    })

    const svenchPlugin = createPlugin(parts)

    config.plugins.unshift(svenchPlugin)

    // ensure all our extensions (even injected ones) are handled by Nollup
    // hot compat plugin (if applicable)
    const compatNollup = config.plugins.find(
      x => x && x.name === 'hot-compat-nollup'
    )
    if (compatNollup) {
      const filter = options.extensions.map(
        ext => `*.${ext.replace(/^\./, '')}`
      )
      compatNollup.$.addFilter(filter)
    }

    return config
  },
  (getConfig, { configFunction, isNollup }) => {
    if (configFunction && !isNollup) return getConfig
    return Promise.resolve(getConfig).then(getConfig => getConfig())
  }
)

// // TODO deprecate / remove
// svenchify.svelte = (sveltePlugin, config) => {
//   // avoid double wrapping
//   if (sveltePlugin._IS_SVENCH_WRAPPED) return sveltePlugin(config)
//   // try to avoid creating an useless instance (to avoid double warnings)
//   // NOTE check process.env.SVENCH just in time
//   const hooks = process.env.SVENCH ? {} : sveltePlugin(config)
//   hooks[SVENCH] = { sveltePlugin, config }
//   return hooks
// }
//
// // TODO deprecate / remove
// export const withSvench = (
//   svelte,
//   { enabled = !!process.env.SVENCH, ...opts }
// ) => {
//   if (!enabled) return svelte
//
//   return ({ preprocess, ...svelteOptions }) => {
//     const parts = createPluginParts({
//       preprocess,
//       ...opts,
//     })
//
//     const svench = createPlugin(parts)
//
//     const {
//       options: { svelte: svelteOverrides },
//     } = parts
//
//     const sveltePlugin = svelte({
//       ...svelteOptions,
//       ...svelteOverrides,
//       preprocess: {
//         markup: parts.preprocess.pull,
//       },
//     })
//
//     const placeholder = {
//       name: 'svelte-svench-placeholder',
//       options(opts) {
//         const index = opts.plugins.indexOf(placeholder)
//         const plugins = [...opts.plugins]
//         plugins.splice(index, 1, svench, sveltePlugin)
//         return svench.options({
//           ...opts,
//           plugins,
//         })
//       },
//     }
//
//     return placeholder
//   }
// }
