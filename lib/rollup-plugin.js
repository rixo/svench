import * as path from 'path'
import * as fs from 'fs'
import Routix from 'routix/rollup'

import { pipe, escapeRe, mkdirp, mkdirpSync } from './util'
import findup from './findup'
import parseMeta from './parse'

import { defaults, svenchifyDefaults, defaultOutput } from './config'
import injectTransform from './transform'
import createServer from './server'
import createIndex, { _template } from './template'
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

const equals = (a, b) => {
  if (a === b) return true
  if (!a || !b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => equals(x, b[i]))
  }
  const ka = Object.keys(a)
  return (
    ka.length === Object.keys(b).length && ka.every(k => equals(a[k], b[k]))
  )
}

const orderPrefixRegex = /(\/|^)[\d-]+_*(?=[^\d-/][^/]*(\/|$))/g

const parser = ({ preprocess }) => options => {
  const { extensions } = options

  const dropExtensions = x =>
    x.replace(
      new RegExp(
        `((?:^|/)[^/]+)(?:${extensions.map(escapeRe).join('|')})(/|$)`,
        'g'
      ),
      '$1$2'
    )

  const getRootDir = path => {
    const i = path.indexOf('/', 1)
    if (i === -1) return null
    return path.slice(1, i)
  }

  const directoriesSortKey = { '/_': '' }

  return async (item, previous) => {
    // item.id = stringHashCode(item.isFile ? item.absolute : `d:${item.path}`)

    if (item.isFile) {
      const { options, hasOptions, views, sources } = await parseMeta(
        preprocess,
        item.absolute
      )
      item.options = options || {}
      item.hasOptions = hasOptions
      item.views = views
      item.extra = { sources }
    }

    item.options = item.options || {}

    const pathWithExtensions = item.path

    const filename = item.relative || item.absolute || item.path
    item.ext = extensions.find(x => filename.endsWith(x))

    // drop file extensions
    item.path = dropExtensions(item.path)

    // "real" path
    if (item.isFile) {
      item.dir = path
        .dirname(item.relative)
        .replace(/\\/g, '/')
        .replace(/^\.$/, '')
    } else {
      item.dir = path.posix
        .dirname(item.path.replace(/^\//, ''))
        .replace(/^\/$/, '')
    }
    // dir: extensions
    item.dir = dropExtensions(item.dir)
    // dir: order prefix
    item.dir = item.dir.replace(orderPrefixRegex, '$1')

    // . => /
    item.path = item.path.replace(/\./g, '/')

    let dirSortKey
    if (item.isFile) {
      const dirname = path.posix.dirname(item.path)
      if (dirname !== '/') {
        dirSortKey = path.posix.basename(dirname)
      }
    }

    // order prefix 00-
    const basename = path.posix.basename(item.path)
    item.sortKey =
      item.options.order != null
        ? item.options.order + '-' + basename
        : basename
    if (!/^[\d-]*_*$/.test(basename)) {
      item.path = item.path.replace(orderPrefixRegex, '$1')
      item.segment = basename.replace(orderPrefixRegex, '$1')
    } else {
      item.segment = basename
    }

    if (item.isFile) {
      if (dirSortKey) {
        directoriesSortKey[path.posix.dirname(item.path)] = dirSortKey
      }
    } else if (directoriesSortKey[item.path] != null) {
      item.sortKey = directoriesSortKey[item.path]
    }

    // index
    if (item.path.endsWith('/index')) {
      item.tree = false
    }

    // title: '_' => ' '
    item.title = item.options.title || item.segment.replace(/_+/g, ' ')

    item.canonical = item.path

    // options: section, path
    if (item.isFile) {
      if (item.options.path) {
        if (item.options.path.includes('|')) {
          const [section, path] = item.options.path.split('|')
          item.options.section = section
          item.path = '/' + path.replace(/^\//, '')
        } else {
          item.path = '/' + item.options.path.replace(/^\//, '')
        }
      }

      if (item.options && item.options.section) {
        item.path = '/' + item.options.section.replace(/\s/g, '_') + item.path
      } else {
        const dirWithoutExt = getRootDir(item.path)
        const dir = getRootDir(pathWithExtensions)
        if (dir && dirWithoutExt !== dir) {
          // item.options.section = dirWithoutExt
        } else {
          // default section (root)
          item.path = '/_' + item.path
        }
      }
    }

    // bails from needless rebuild
    if (
      previous &&
      previous.path === item.path &&
      previous.canonical === item.canonical &&
      previous.dir === item.dir &&
      previous.segment === item.segment &&
      previous.sortKey === item.sortKey &&
      previous.title === item.title &&
      equals(previous.options, item.options) &&
      equals(previous.views, item.views)
    ) {
      item.rebuild = false
    }

    return item
  }
}

const format = ({
  isFile,
  id,
  ext,
  dir,
  canonical,
  segment,
  sortKey,
  title,
  options,
  views,
}) => ({
  id,
  ext,
  dir,
  segment,
  sortKey,
  title,
  canonical,
  ...(isFile && { options, views }),
})

let server

const bySortKey = (a, b) =>
  a.sortKey === b.sortKey ? 0 : a.sortKey < b.sortKey ? -1 : 1

const withDefaults = defaults => options => {
  const parsed = { ...options }

  const parse = (prop, def) => {
    if (!options.hasOwnProperty(prop)) return def
    const opt = options[prop]
    if (!opt) return opt
    if (typeof def === 'object' && !Array.isArray(def)) {
      return { ...def, ...opt }
    }
    return opt
  }

  for (const [prop, def] of Object.entries(defaults)) {
    parsed[prop] = parse(prop, def)
  }

  return parsed
}

const ifCanServe = value => {
  if (!process.env.ROLLUP_WATCH) return false
  if (process.env.NOLLUP && value && !value.nollup) return false
  return value
}

const parseOptions = pipe(
  // override.output: use default if override.output === true, otherwise default
  // to nothing
  ({ override, ...options }) => ({
    ...options,
    override: override && {
      ...override,
      output: override.output === true ? defaultOutput : override.output,
    },
  }),
  // disable serve if not ROLLUP_WATCH or if NOLLUP
  ({ serve, ...options }) => ({
    ...options,
    serve: ifCanServe(serve),
  })
)

const createPlugin = ({
  enabled,
  watch,
  dir,
  extensions,
  preprocess,

  override = null,
  addInput = false,
  preserveOutputFileName = true,

  index: indexCfg,

  serve,

  mountEntry,
}) => {
  if (!enabled) {
    return { name: 'svench (disabled)' }
  }

  if (server) {
    server.close()
  }
  if (serve && watch) {
    server = createServer(serve, { mountEntry })
  }

  const root = path.dirname(findup(__dirname, 'package.json'))

  mkdirpSync(path.resolve(root, 'tmp'))

  const { $$, ...routix } = Routix({
    dir,
    extensions,
    write: {
      routes: path.resolve(root, 'tmp/routes.js'),
      extras: path.resolve(root, 'tmp/extras.js'),
    },
    merged: true,
    leadingSlash: true,
    parser: parser({ preprocess }),
    format,
    // sortFiles: bySortKey,
    // sortDirs: bySortKey,
    sortChildren: bySortKey,
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

    const publicDirs = !publicDir
      ? []
      : Array.isArray(publicDir)
      ? publicDir
      : [publicDir]

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

    async writeBundle(outputOptions) {
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

      await start(outputOptions).catch(err => {
        this.error(err)
      })
    },
  }
}

const _plugin = pipe(parseOptions, createPlugin)

export const plugin = pipe(withDefaults(defaults), _plugin)

export const svenchify = Svenchify(
  pipe(withDefaults(svenchifyDefaults), _plugin)
)
