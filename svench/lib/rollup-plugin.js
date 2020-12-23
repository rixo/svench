import * as path from 'path'
import * as fs from 'fs'
import { rollupPlugin as Routix } from 'routix'

import { pipe, mkdirp, mkdirpSync } from './util.js'
import injectTransform from './transform.js'
import createServer from './server.js'
import { createIndex, _template } from './template.js'
import { writeManifestSync } from './service-manifest.js'
import Svenchify from './rollup-svenchify.js'
import { createPluginParts } from './plugin-shared.js'
import { finalizeRollupOptions } from './rollup-options.js'

// const entry = {
//   shadow: ENTRY_PATH,
//   shadowLight: path.resolve(__dirname, 'svench.shadow-light.js'),
// }

const tap = fn => x => (fn(x), x)

const overrideInputOptions = ({ override, entryFile }) => original => {
  const options = { ...original }
  if (override) {
    // eslint-disable-next-line no-unused-vars
    const { output, ...inputOptions } = override
    Object.assign(options, inputOptions)
    if (options.input === true) {
      options.input = entryFile
    }
    // plugins
    if (override.plugins) {
      if (typeof override.plugins === 'function') {
        options.plugins = override.plugins(original.plugins)
      } else {
        options.plugins = [...original.plugins, ...override.plugins]
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

    override = null,
    preserveOutputFileName = true,

    index: indexCfg,

    serve,
    isNollup,

    mountEntry,
  },
  routix,
  preprocess,
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

    // TODO remove deps in Svenchify & remove
    $: {
      preprocess: {
        markup: preprocess.pull,
      },
    },

    options: pipe(
      tap(saveOriginalInput),
      tap(findHotPlugin),
      overrideInputOptions({ override, entryFile }),
      injectTransform({ extensions, routix }),
      tap(saveInputOptions)
    ),

    outputOptions(outputOptions) {
      originalOutputFile = outputOptions.file
      return (override && override.output) || outputOptions
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

const createParts = opts =>
  createPluginParts({
    presets: 'svench/presets/rollup',
    ...opts,
    _finalizeOptions: finalizeRollupOptions,
  })

export const plugin = pipe(createParts, createPlugin)

// export const svenchify = Svenchify(createPlugin)
export const svenchify = Svenchify(plugin)

export const withSvench = (
  svelte,
  { enabled = !!process.env.SVENCH, ...opts }
) => {
  if (!enabled) return svelte

  return ({ preprocess, ...svelteOptions }) => {
    const parts = createParts({
      preprocess,
      ...opts,
    })

    const svench = createPlugin(parts)

    const {
      options: { svelte: svelteOverrides },
    } = parts

    const sveltePlugin = svelte({
      ...svelteOptions,
      ...svelteOverrides,
      preprocess: {
        markup: parts.preprocess.pull,
      },
    })

    const placeholder = {
      name: 'svelte-svench-placeholder',
      options(opts) {
        const index = opts.plugins.indexOf(placeholder)
        const plugins = [...opts.plugins]
        plugins.splice(index, 1, svench, sveltePlugin)
        return svench.options({
          ...opts,
          plugins,
        })
      },
    }

    return placeholder
  }
}
