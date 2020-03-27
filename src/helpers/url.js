import { get } from 'svelte/store'
import { getContext as getSvenchContext, noop } from '../util.js'
import { resolveUrl, trimIndex } from './url.impl.js'

const repeat = (x, n) => Array.from({ length: n }).map(() => x)

const relativeTo = (route, path) => {
  const segments = trimIndex(route.path).split('/')
  const nesting = route.extraNesting
  const parts = [
    ...repeat('..', nesting),
    ...(nesting > 0 ? segments.slice(1, -nesting) : segments.slice(1)),
  ]
  if (path) {
    parts.push(path)
  }
  return parts.join('/')
}

export const urlResolver = route => (path, ...args) => {
  const { path: from } = route
  const relative = path.startsWith('/') // /absolute
    ? path
    : path.startsWith('.') // ./relative/fs
    ? path.replace(/^\.\//, '../'.repeat(route.extraNesting))
    : relativeTo(route, path) // relative/virtual
  const virtual = relative.replace(/(?<!\.|^|\/)\.(?!\.)/g, '/')
  // {
  //   const { extraNesting, isIndex } = route
  //   console.log(
  //     'urlResolver',
  //     { path: route.path, extraNesting, isIndex },
  //     path,
  //     ...args
  //   )
  // }
  return resolveUrl(from, virtual, ...args)
}

export const url = {
  subscribe: listener => {
    const { route$ } = getSvenchContext()
    listener(urlResolver(get(route$)))
    return noop
  },
}
