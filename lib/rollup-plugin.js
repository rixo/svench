const path = require('path')
const Routix = require('routix/rollup')
const { escapeRe } = require('./util')
const { stringHashCode } = require('./hash')

const orderPrefixRegex = /(\/|^)[\d-]+_*(?=[^\d-/][^/]*(\/|$))/g

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

  return (item, previous) => {
    item.id = stringHashCode(item.isFile ? item.absolute : `d:${item.path}`)

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

    // bails from needless rebuild
    if (previous && previous.path === item.path) {
      return false
    }

    return item
  }
}

const format = ({ id, dir, segment, sortKey, title }) => ({
  id,
  dir,
  segment,
  sortKey,
  title,
})

module.exports = ({
  dir = './src',
  extensions = ['.svench', '.svench.svelte'],
} = {}) => ({
  ...Routix({
    dir,
    extensions,
    write: true,
    leadingSlash: true,
    parser,
    format,
  }),
  name: 'svench',
})
