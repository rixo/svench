const path = require('path')
const fs = require('fs')
const Routix = require('routix/rollup')
const { escapeRe } = require('./util')
const findup = require('./findup')
const parseMeta = require('./parse')

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

  return async (item, previous) => {
    // item.id = stringHashCode(item.isFile ? item.absolute : `d:${item.path}`)

    // drop file extensions
    item.path = dropExtensions(item.path)

    // "real" path
    if (item.isFile) {
      item.dir = path
        .dirname(item.relative)
        .replace(/\\/g, '/')
        .replace(/^\.$/, '')
    } else {
      item.dir = path.posix.dirname(item.path).replace(/^\/$/, '')
    }
    // dir: extensions
    item.dir = dropExtensions(item.dir)
    // dir: order prefix
    item.dir = item.dir.replace(orderPrefixRegex, '$1')

    // . => /
    item.path = item.path.replace(/\./g, '/')

    // order prefix 00-
    const basename = path.basename(item.path)
    item.sortKey = basename
    if (!/^[\d-]*_*$/.test(basename)) {
      item.path = item.path.replace(orderPrefixRegex, '$1')
      item.segment = basename.replace(orderPrefixRegex, '$1')
    } else {
      item.segment = basename
    }

    // index
    if (item.path.endsWith('/index')) {
      item.tree = false
    }

    // title: '_' => ' '
    item.title = item.segment.replace(/_+/g, ' ')

    if (item.isFile) {
      const { options, views, sources } = await parseMeta(
        preprocess,
        item.absolute
      )
      item.options = options
      item.views = views
      item.extra = { sources }
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

module.exports = ({
  dir = './src',
  extensions = ['.svench', '.svench.svelte'],
  preprocess,
} = {}) => {
  const root = path.dirname(findup(__dirname, 'package.json'))

  fs.mkdirSync(path.resolve(root, 'tmp'), { recursive: true })

  return {
    ...Routix({
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
    }),

    name: 'svench',
  }
}
