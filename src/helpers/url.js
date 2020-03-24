import { derived } from 'svelte/store'
import { makeUrlHelper } from '@sveltech/routify'
import { getContext as getSvenchContext, noop } from '../util.js'

export const urlResolver = ($routes, route) => {
  if (!route) return noop
  const $url = makeUrlHelper(
    { component: { path: route.path } },
    route,
    $routes
  )
  return (path, params, strict) => {
    const relative = path.startsWith('.')
      ? path.replace(/^.\//, '../'.repeat(1 + route.extraNesting))
      : path
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
