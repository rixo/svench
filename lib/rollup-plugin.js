const path = require('path')
const Routix = require('routix/rollup')
const { escapeRe } = require('./util')

const orderPrefixRegex = /(\/|^)[\d-]+_*(?=[^\d-/][^/]*(\/|$))/g

const parseVirtual = item => {
  const segment = path.posix.basename(item.path)
  return Object.assign(item, {
    segment,
    sortKey: segment,
    title: segment.replace(/_+/g, ' '),
  })
}

const parse = (item, { extensions }) => {
  if (item.isVirtual) {
    return parseVirtual(item)
  }

  // drop file extensions
  item.path = item.path.replace(
    new RegExp(
      `((?:^|/)[^/]+)(?:${extensions.map(escapeRe).join('|')})(/|$)`,
      'g'
    ),
    '$1$2'
  )

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

  item.title = item.segment.replace(/_+/, ' ')

  return item
}

module.exports = ({
  dir = './src',
  extensions = ['.svench', '.svench.svelte'],
} = {}) => ({
  ...Routix({ dir, extensions, write: true, parse }),
  name: 'svench',
})
