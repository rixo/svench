import { get } from 'svelte/store'
import { getContext as getSvenchContext, noop } from '../util.js'
import { resolveUrl, trimIndex } from './url.impl.js'

const repeat = (x, n) => Array.from({ length: n }).map(() => x)

const relativeTo = (route, path) => {
  const segments = route.shortPath.split('/')
  const nesting = route.svench.extraNesting - (route.isIndex ? 1 : 0)
  const parts = [
    ...repeat('..', nesting),
    ...(nesting > 0 ? segments.slice(1, -nesting) : segments.slice(1)),
  ]
  if (nesting < 1) {
    parts.unshift('')
  }
  if (path) {
    parts.push(path)
  }
  return parts.join('/')
}

export const urlResolver = route => {
  return (path, ...args) => {
    const { shortPath: from } = route
    const relative = path.startsWith('/') // /absolute
      ? path
      : path.startsWith('.') // ./relative/fs
      ? path.replace(
          /^\.\//,
          '../'.repeat(
            Math.max(
              0,
              route.svench.extraNesting -
                (route.path.endsWith('/index') ? 1 : 0)
            )
          ) || './'
        )
      : relativeTo(route, path) // relative/virtual
    const virtual = relative.replace(/([^./])\.(?!\.)/g, '$1/')
    return resolveUrl(from, virtual, ...args)
  }
}

export const url = {
  subscribe: listener => {
    const { route$ } = getSvenchContext()
    listener(urlResolver(get(route$)))
    return noop
  },
}
