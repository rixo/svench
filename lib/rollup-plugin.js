import * as path from 'path'
import * as fs from 'fs'
import Routix from 'routix/rollup'

import { pipe, escapeRe, mkdirp, mkdirpSync } from './util'
import findup from './findup'
import parseMeta from './parse'

import { ENTRY_URL } from './const'
import injectTransform from './transform'
import createServer from './server'
import createIndex, { _template } from './template'

const entry = path.resolve(__dirname, 'svench.js')

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
    if (options.input === true) {
      options.input = entry
    }
  }
  if (addInput) {
    const target = addInput === true ? entry : addInput
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
      const { options, optionsNode, views, sources } = await parseMeta(
        preprocess,
        item.absolute
      )
      item.options = options || {}
      item.optionsNode = optionsNode
      item.views = views
      item.extra = { sources }
    }

    const pathWithExtensions = item.path

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
    item.sortKey = basename
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
    item.title = item.segment.replace(/_+/g, ' ')

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
  dir,
  segment,
  sortKey,
  title,
  options,
  views,
}) => ({
  id,
  dir,
  segment,
  sortKey,
  title,
  ...(isFile && { options, views }),
})

let server

const bySortKey = (a, b) =>
  a.sortKey === b.sortKey ? 0 : a.sortKey < b.sortKey ? -1 : 1

const parseOptions = options => options

const createPlugin = ({
  enabled = !!process.env.SVENCH,
  watch = !!process.env.ROLLUP_WATCH,
  dir = './src',
  extensions = ['.svench', '.svench.svelte'],
  preprocess,

  override = null,
  addInput = false,
  preserveOutputFileName = true,

  index: indexCfg,

  serve,
} = {}) => {
  if (!enabled) {
    return { name: 'svench (disabled)' }
  }

  if (!process.env.ROLLUP_WATCH) {
    serve = false
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
    sortFiles: bySortKey,
    sortDirs: bySortKey,
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

  const start = async (outputOptions = {}) => {
    const { file, dir } = outputOptions
    const publicDir = outputOptions.public || (serve && serve.public)

    const script =
      publicDir && file
        ? '/' + path.relative(publicDir, file).replace(/\\/g, '/')
        : publicDir && dir
        ? '/' +
          path
            .join(path.relative(publicDir, dir), path.basename(entry))
            .replace(/\\/g, '/')
        : null

    const getIndex = indexCfg
      ? await createIndex(indexCfg, { watch, script, onChange: hotReload })
      : _template({ script })

    if (server) {
      server.close()
    }

    if (serve && watch) {
      server = createServer(serve, { getIndex })
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

    async renderStart(outputOptions) {
      await start(outputOptions).catch(err => {
        this.error(err)
      })
    },

    async writeBundle(outputOptions) {
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
      const src = path.resolve(outputOptions.dir, path.basename(originalInput))
      const dest = originalOutputFile
      await mkdirp(path.dirname(originalOutputFile))
      await fs.promises.rename(src, dest)
    },
  }
}

const Svench = pipe(parseOptions, createPlugin)

Object.assign(Svench, { entry, ENTRY_URL })

export default Svench
