import { getContext, noop } from '../util.js'

const resolveRaw = (route, path) => {
  if (path.startsWith('.')) return ['', route.dir, path].join('/')
  if (path.startsWith('/')) return path
  return ['', ...route.canonical.split('/').slice(0, -1), path].join('/')
}

const resolveUp = path =>
  path.split('../').reduce((lead, next) => lead.replace(/[^/]+\/$/, next))

const clean = path =>
  path.replace(/(?:\/|^)\.(?=\/|$)/g, '/').replace(/\/{2,}/g, '/')

export const urlResolver = route => path =>
  resolveUp(clean(resolveRaw(route, path)))

export const url = {
  subscribe: listener => {
    const { route } = getContext()
    listener(urlResolver(route))
    return noop
  },
}
