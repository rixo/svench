const path = require('path')
const fs = require('fs')
const Routix = require('routix/rollup')
const { pipe, escapeRe } = require('./util')
const findup = require('./findup')
const parseMeta = require('./parse')

const INJECTED = Symbol('SVENCH OPTIONS INJECTED')

const injectTransform = ({ extensions, $$ }) => options => {
  if (options[INJECTED]) return

  options[INJECTED] = true

  const svelteIndex = options.plugins.findIndex(({ name }) =>
    /^svelte\b/.test(name)
  )

  if (svelteIndex === -1) {
    throw new Error('Failed to find Svelte plugin')
  }

  const beforeSvelte = {
    name: 'svench:before',
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) return null

      const item = $$.get(id)

      if (item && item.optionsNode) {
        const { start, end } = item.optionsNode
        code =
          code.slice(0, start) +
          code.slice(start, end).replace(/\S/g, ' ') +
          code.slice(end)
        return { code, map: null }
      }

      return null
    },
  }

  const afterSvelte = {
    name: 'svench:after',
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) return null

      const match = /\bexport\s+default\s+([\S]+)/.exec(code)

      if (!match) throw new Error('Failed to find default export')

      const item = $$.get(id)

      code += `;${match[1]}.$$svench_id = ${JSON.stringify(item.id)};`

      return { code, map: null }
    },
  }

  // options.plugins = [beforeSvelte, ...options.plugins, afterSvelte]
  options.plugins = [
    beforeSvelte,
    ...options.plugins.slice(0, svelteIndex + 1),
    afterSvelte,
    ...options.plugins.slice(svelteIndex + 1),
  ]

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
      const { options, optionsNode, views, sources } = await parseMeta(
        preprocess,
        item.absolute
      )
      item.options = options
      item.optionsNode = optionsNode
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
  enabled = !!process.env.SVENCH,
  dir = './src',
  extensions = ['.svench', '.svench.svelte'],
  preprocess,
} = {}) => {
  if (!enabled) {
    return { name: 'svench (disabled)' }
  }

  const root = path.dirname(findup(__dirname, 'package.json'))

  fs.mkdirSync(path.resolve(root, 'tmp'), { recursive: true })

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
  })

  return {
    ...routix,

    name: 'svench',

    options: pipe(injectTransform({ extensions, $$ })),
  }
}
