import { getContext, noop, pipe, split, reduce } from '../util.js'
import { sectionPrefix } from '../constants'

const resolveRaw = route =>
  function _resolveRaw(path) {
    if (path.startsWith('/')) return path
    if (path.startsWith('.')) return ['', route.dir, path].join('/')
    const segments = route.canonical.split('/').slice(0, -1)
    return [...segments, path].join('/')
  }

const dropSectionPrefix = path =>
  path.startsWith(sectionPrefix) ? path.slice(sectionPrefix.length) : path

const resolveUp = pipe(
  split('../'),
  reduce((lead, next) => lead.replace(/[^/]+\/$/, next))
)

// /./ => /
// // => /
const normalize = path =>
  path.replace(/(?:\/|^)\.(?=\/|$)/g, '/').replace(/\/{2,}/g, '/')

// replace . with /
const replaceVirtuals = path => path.replace(/\.(?![./])/g, '/')

// route => path => resolvedPath
//
// canonical: used by Render, to resolve real FS (whereas non canonical
// resolves virtual section URLs /_/section/...)
//
const urlResolver = (route, canonical = false) =>
  pipe.safe(
    resolveRaw(route, canonical),
    normalize,
    replaceVirtuals,
    canonical && dropSectionPrefix,
    resolveUp,
    normalize
  )

export const canonicalResolver = route => pipe(urlResolver(route, true))

export const url = {
  subscribe: listener => {
    const { route } = getContext()
    listener(urlResolver(route))
    return noop
  },
}
