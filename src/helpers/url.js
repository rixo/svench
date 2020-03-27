import { derived } from 'svelte/store'
import { makeUrlHelper } from '@sveltech/routify'
import { getContext as getSvenchContext, noop } from '../util.js'

const repeat = (x, n) => Array.from({ length: n }).map(() => x)

const relativeTo = (route, path) => {
  const segments = route.path.split('/')
  const nesting = route.extraNesting
  const parts = [
    ...repeat('..', 1 + nesting),
    ...(nesting > 0 ? segments.slice(1, -nesting) : segments),
    path,
  ]
  return parts.join('/')
}

export const urlResolver = ($routes, route) => {
  if (!route) return noop
  const $url = makeUrlHelper(
    { component: { path: route.path } },
    route,
    $routes
  )
  return (path, params, strict) => {
    const relative = path.startsWith('/')
      ? path
      : path.startsWith('.')
      ? path.replace(/^\.\//, '../'.repeat(1 + route.extraNesting))
      : relativeTo(route, path)
    const virtual = relative.replace(/(?<!\.)\.(?!\.)/g, '/')
    return $url(virtual, params, strict)
  }
}

export const url = {
  subscribe: listener => {
    const { routes, route$ } = getSvenchContext()
    return derived([routes, route$], args => urlResolver(...args)).subscribe(
      listener
    )
  },
}
