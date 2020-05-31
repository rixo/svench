import * as path from 'path'

import { escapeRe } from './util'
import parseMeta from './parse-meta'

const nope = () => false

const toArray = x => [x].flat()

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

const extMatcher = arg => {
  if (!arg) return nope
  const exts = Array.isArray(arg) ? arg : [arg]
  return x => x && exts.some(ext => x.endsWith(ext))
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

const bySortKey = (a, b) =>
  a.sortKey === b.sortKey ? 0 : a.sortKey < b.sortKey ? -1 : 1

const getRootDir = path => {
  const i = path.indexOf('/', 1)
  if (i === -1) return null
  return path.slice(1, i)
}

export default ({ preprocess, autoPage, autoComponentIndex }) => {
  const directoriesSortKey = { '/_': '' }

  const isAutoPage = extMatcher(autoPage)

  const isAutoComponentIndex = file =>
    toArray(autoComponentIndex).some(ext => file.ext.endsWith(ext))

  const resolveConflict = (file, existing) => {
    let index = null
    if (file.isIndex) {
      if (existing.isIndex) return false
      index = file
    } else if (existing.isIndex) {
      index = existing
    } else {
      return false
    }
    index.path += '/index'
    // index.canonical += '/index'
    index.tree = false
    return true
  }

  const parser = options => {
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
      if (item.isFile) {
        const { id, options, views } = await parseMeta(
          preprocess,
          item.absolute
        )
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

      // index
      let match
      // if (item.path.endsWith('/index')) {
      if ((match = /(\/(?:index|\.svench\.svench))$/.exec(item.path))) {
        // item.tree = false
        item.path = item.path.slice(0, -match[1].length) || '/'
        // NOTE component index: we delete `/index` suffix in all cases, and we
        // rely on routix's resolveConflict to reappend `/index` for component
        // indexes
        item.isIndex = true
      }
      if (item.isFile && isAutoComponentIndex(item)) {
        item.isIndex = true
      }

      // ------ WARNING don't change path after this line ------
      //
      // (for path to be correctly reflected in path)

      item.canonical = item.path

      // order prefix 00-, & segment
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

      // title: '_' => ' '
      item.title = item.options.title || item.segment.replace(/_+/g, ' ')

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
          } else if (item.path !== '/') {
            // default section (root)
            //
            // NOTE we don't want to convert / to /_ because the latter has no
            // menu entry, and the former needs to be the root index (by spec)
            //
            item.path = '/_' + item.path
          }
        }
      }

      // options: page (auto page from extension)
      if (autoPage && item.isFile && item.options.page == null) {
        item.options.page = isAutoPage(item.ext)
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

  return {
    leadingSlash: true,
    parser,
    resolveConflict,
    format,
    // sortFiles: bySortKey,
    // sortDirs: bySortKey,
    sortChildren: bySortKey,
  }
}
