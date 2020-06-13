import { getContext, noop, pipe, split, reduce } from '../util.js'
import { rootSection } from '../constants'

const inRootSection = ({ path }) => path.startsWith(rootSection)

const isRootIndex = ({ path }) => path === '/' || path === '/index'

// ensure /_/... and /index routes resolve to /_/... urls
const resolveRelativeDir = (route, canonical) => {
  if (!canonical && (inRootSection(route) || isRootIndex(route))) {
    return rootSection + route.dir
  }
  return route.dir
}

const resolveRaw = (route, canonical) => {
  const atRoot = !canonical && (inRootSection(route) || isRootIndex(route))
  // const rootPrefix = atRoot ? rootSection : ''
  const rootPrefix = ''
  return function _resolveRaw(path) {
    if (path.startsWith('/')) return rootPrefix + path
    if (path.startsWith('.'))
      // return ['', resolveRelativeDir(route, canonical), path].join('/')
      return ['', rootPrefix + route.dir, path].join('/')
    const segments = (rootPrefix + route.canonical).split('/').slice(0, -1)
    // if (atRoot) {
    //   segments.unshift(rootSection)
    // }
    return [...segments, path].join('/')
  }
}

const dropDefaultSection = path =>
  path.startsWith(rootSection) ? path.slice(rootSection.length) : path

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
const urlResolver = (route, canonical = false) =>
  pipe.safe(
    resolveRaw(route, canonical),
    normalize,
    replaceVirtuals,
    canonical && dropDefaultSection,
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
