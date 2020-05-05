import { getContext, noop, pipe } from '../util.js'

const defaultSection = '_'

const resolveRaw = route => path => {
  if (path.startsWith('.')) return ['', route.dir, path].join('/')
  if (path.startsWith('/')) return path
  return ['', ...route.canonical.split('/').slice(0, -1), path].join('/')
}

const dropDefaultSection = path =>
  path.startsWith('/' + defaultSection)
    ? path.slice(defaultSection.length + 1)
    : path

const resolveUp = path =>
  path.split('../').reduce((lead, next) => lead.replace(/[^/]+\/$/, next))

const clean = path =>
  path.replace(/(?:\/|^)\.(?=\/|$)/g, '/').replace(/\/{2,}/g, '/')

// route => path => resolvedPath
export const urlResolver = route =>
  pipe(dropDefaultSection, resolveUp, clean, resolveRaw(route))

export const url = {
  subscribe: listener => {
    const { route } = getContext()
    listener(urlResolver(route))
    return noop
  },
}
