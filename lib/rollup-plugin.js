import * as path from 'path'
import * as fs from 'fs'
import Routix from 'routix/rollup'

import { pipe, mkdirp, mkdirpSync } from './util'
import routixParser from './routix-parser'
import cachingPreprocess from './caching-preprocess'
import { parseOptions } from './config'
import injectTransform from './transform'
import createServer from './server'
import { createIndex, _template } from './template'
import Svenchify from './rollup-svenchify'

const entryPath = path.resolve(__dirname, 'svench.js')

const entry = {
  shadow: entryPath,
  shadowLight: path.resolve(__dirname, 'svench.shadow-light.js'),
}

const tap = fn => x => {
  fn(x)
  return x
}

const overrideInput = (override, addInput) => original => {
  const options = { ...original }
  if (override) {
    // eslint-disable-next-line no-unused-vars
    const { output, ...inputOptions } = override
    Object.assign(options, inputOptions)
    if (options.input === true || options.input === entry) {
      options.input = entryPath
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
  if (addInput) {
    const target =
      addInput === true || addInput === entry ? entryPath : addInput
    options.input = [original.input, target].flat().filter(Boolean)
  }
  return options
}

let globalServer

const createPlugin = ({
  enabled,
  watch,
  dir,
  manifestDir,
  extensions,
  preprocess: preprocessors,

  override = null,
  addInput = false,
  preserveOutputFileName = true,

  index: indexCfg,

  serve,
  isNollup,

  mountEntry,

  mdsvex,
  autoComponentIndex,
}) => {
  if (!enabled) {
    return { name: 'svench (disabled)' }
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

  mkdirpSync(path.resolve(manifestDir))

  const preprocess = cachingPreprocess({ extensions, preprocessors, mdsvex })

  // eslint-disable-next-line no-unused-vars
  const { $$, ...routix } = Routix({
    dir,
    extensions,
    write: {
      routes: path.resolve(manifestDir, 'routes.js'),
      // extras: path.resolve(root, 'tmp/extras.js'),
    },
    merged: true,
    ...routixParser({
      preprocess: preprocess.push,
      autoComponentIndex,
    }),
  })

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

  const start = async (outputOptions = {}) => {
    if (started) return

    started = true

    const { file, dir } = outputOptions
    const publicDir = serve && serve.public

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
        : await createIndex(indexCfg, { watch, script, onChange: hotReload })
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
    ...routix,

    name: 'svench',

    $: {
      preprocess: {
        markup: preprocess.pull,
      },
    },

    options: pipe(
      tap(saveOriginalInput),
      tap(findHotPlugin),
      overrideInput(override, addInput),
      injectTransform({ extensions, $$ }),
      tap(saveInputOptions)
    ),

    outputOptions(outputOptions) {
      if (!override) return
      originalOutputFile = outputOptions.file
      return { ...outputOptions, ...override.output }
    },

    // async renderStart(outputOptions) {
    //   await start(outputOptions).catch(err => {
    //     this.error(err)
    //   })
    // },

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
        // we will change to output.dir, so Rollup will output the user's original
        // entry point to `[name].js` or the like... and so we need to rename the
        // produced file to what the user's system actually expects
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

export const plugin = pipe(parseOptions, createPlugin)

export const svenchify = Svenchify(createPlugin)
