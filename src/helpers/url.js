import { getContext } from 'svelte'
import { get, derived } from 'svelte/store'
import { getContext as getSvenchContext } from '../util.js'
import { route as routifyRoute, _url, routes } from '@sveltech/routify'

export const url = {
  subscribe: listener => {
    let route = getSvenchContext().route
    if (route === undefined) route = get(routifyRoute)
    if (!route) throw new Error('Missing route in Svench context')
    return derived([routes, getContext('routify')], ([$routes, context]) => {
      const $url = _url({ ...context, path: route.path }, route, $routes)
      return (path, params, strict) => {
        const relative = path.startsWith('.')
          ? path.replace(/^.\//, '../'.repeat(1 + route.extraNesting))
          : path
        const virtual = relative.replace(/(?<!\.)\.(?!\.)/g, '/')
        return $url(virtual, params, strict)
      }
    }).subscribe(listener)
  },
}
