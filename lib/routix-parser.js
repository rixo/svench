import * as path from 'path'

import { escapeRe } from './util'
import parseMeta from './parse-meta'

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

export default ({ preprocess }) => options => {
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
      const { id, options, views } = await parseMeta(preprocess, item.absolute)
      item.id = id
      item.options = options || {}
      item.views = views
      item.extra = {}
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
