import { getContext, noop, pipe, split, reduce } from '../util.js'

const defaultSection = '_'

const resolveRaw = route =>
  function _resolveRaw(path) {
    if (path.startsWith('.')) return ['', route.dir, path].join('/')
    if (path.startsWith('/')) return path
    const segments = route.canonical.split('/')
    // NOTE index routes "canonical" paths is /path/to/index, but they are
    // stored either as /path/to or /path/to/index; the base must be /path/to
    // in every case
    // NOTE /path/to OR (not xor) /path/to/index (because of auto index)
    if (segments[segments.length - 1] === 'index') {
      segments.pop()
    }
    const base = segments.slice(0, -1)
    return ['', base, path].join('/')
  }

const dropDefaultSection = path =>
  path.startsWith('/' + defaultSection)
    ? path.slice(defaultSection.length + 1)
    : path

const resolveUp = pipe(
  split('../'),
  reduce((lead, next) => lead.replace(/[^/]+\/$/, next))
)

// /./ => /
// // => /
const normalize = path =>
  path.replace(/(?:\/|^)\.(?=\/|$)/g, '/').replace(/\/{2,}/g, '/')

// replace . with /
const replaceVirtuals = path => path.replace(/\./g, '/')

// route => path => resolvedPath
export const urlResolver = route =>
  pipe(
    resolveRaw(route),
    normalize,
    replaceVirtuals,
    dropDefaultSection,
    resolveUp,
    normalize
  )

export const url = {
  subscribe: listener => {
    const { route } = getContext()
    listener(urlResolver(route))
    return noop
  },
}
