import * as path from 'path'

import Log from './log.js'
import { escapeRe } from './util.js'
import { parseMeta } from './parse-meta.js'

const sectionBase = '/_'
const sectionPrefix = '/_/'

const dropSectionPrefix = x =>
  x.startsWith(sectionBase) ? x.slice(sectionBase.length) : x

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

// const extMatcher = arg => {
//   if (!arg) return nope
//   const exts = Array.isArray(arg) ? arg : [arg]
//   return x => x && exts.some(ext => x.endsWith(ext))
// }

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
  headings,
  // isIndex,
}) => ({
  id,
  ext,
  dir,
  segment,
  sortKey,
  title,
  canonical,
  // isIndex,
  ...(isFile && { options, views, headings }),
})

const bySortKey = (a, b) =>
  a.sortKey === b.sortKey ? 0 : a.sortKey < b.sortKey ? -1 : 1

const getRootDir = path => {
  const i = path.indexOf('/', 1)
  if (i === -1) return null
  return path.slice(1, i)
}

export default ({
  preprocess,
  autoComponentIndex,
  autoSections,
  keepTitleExtensions = ['.md'],
}) => {
  const directoriesSortKey = { '/_': '' }

  autoComponentIndex = toArray(autoComponentIndex)

  const isAutoComponentIndex = file =>
    autoComponentIndex.some(ext => file.ext.endsWith(ext))

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
    // <svench:options tree />
    file.tree = !!file.options.tree
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
        try {
          const { options, views, headings } = await parseMeta(
            preprocess,
            item.absolute
          )
          item.options = options || {}
          item.views = views
          item.headings = headings
          item.extra = {}
        } catch (err) {
          Log.warn("Failed to parse %s:\n%s", item.relative, err)
          item.options = {}
          // item.views = []
          // item.headings = []
          item.extra = {}
        }
      }

      item.options = item.options || {}

      const pathWithExtensions = item.path

      const filename = item.relative || item.absolute || item.path
      item.ext = extensions.find(x => filename.endsWith(x))

      // TODO .svench.svench
      if (path.basename(filename) === '.svench.svench') {
        return false
      }

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
      } else {
        const dir = dropSectionPrefix(item.path)
        if (directoriesSortKey[dir] != null) {
          item.sortKey = directoriesSortKey[dir]
        }
      }

      item.canonical = item.path

      // index
      // if (item.path.endsWith('/index')) {
      if (/(\/(?:index(?:\.svench)?|\.svench\.svench))$/.test(item.path)) {
        item.tree = !!item.options.tree
        item.isIndex = true
      }
      if (item.isFile && isAutoComponentIndex(item)) {
        item.isIndex = true
      }

      // title: '_' => ' '
      item.title =
        item.options.title ||
        item.segment.replace(/_+/g, ' ') +
          (keepTitleExtensions && keepTitleExtensions.includes(item.ext)
            ? item.ext
            : '')

      // options: section, path
      if (item.isFile) {
        if (item.options.path) {
          if (item.options.path.includes('|')) {
            const [section, path] = item.options.path.split('|')
            item.options.section = section
            item.path = sectionPrefix + path.replace(/^\//, '')
          } else {
            item.path = sectionPrefix + item.options.path.replace(/^\//, '')
          }
        }

        if (item.options && item.options.section) {
          item.path =
            sectionPrefix + item.options.section.replace(/\s/g, '_') + item.path
        } else {
          const dir = getRootDir(pathWithExtensions)
          if (
            (autoSections && autoSections.includes(dir)) ||
            (dir &&
              dir.endsWith('.svench') &&
              // don't prefix root index folder
              !/^\/index(?:\/|$)/.test(item.path))
          ) {
            item.path = sectionPrefix + item.path.replace(/^\//, '')
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
