import { buildRoutes } from '@sveltech/routify/runtime/buildRoutes'

import { pipe } from '../util'
import App from '../app/App.svelte'

import RenderLayout from './RenderLayout.svelte'
import DefaultIndex from './DefaultIndex.svelte'
import DefaultFallback from './DefaultFallback.svelte'

const pageDefaults = {
  layouts: [],
  meta: {},
  svench: {},
  isFile: true,
}

const makeLayout = (x, i, { length }) => {
  if (typeof x === 'function') {
    const Component = x
    x = { component: () => Component }
  }
  return { svench: {}, path: `${'../'.repeat(length - i)}_layout`, ...x }
}

const prependLayouts = (...layouts) => routes =>
  routes.map(({ layouts: currentLayouts, ...route }) => ({
    ...route,
    layouts: [...layouts.map(makeLayout), ...currentLayouts],
  }))

const addDefaultIndexAndFallback = routes => {
  const isUserIndex = r =>
    (r.isIndex && r.path === '/index') || r.shortPath === ''
  const isUserFallback = r => r.isFallback && r.path === '/_fallback'
  let hasUserIndex = false
  let hasUserFallback = false
  for (const route of routes) {
    if (!hasUserIndex && isUserIndex(route)) hasUserIndex = true
    if (!hasUserFallback && isUserFallback(route)) hasUserFallback = true
    if (hasUserIndex && hasUserFallback) break
  }
  const extraRoutes = []
  if (!hasUserIndex) {
    extraRoutes.push({
      ...pageDefaults,
      component: () => DefaultIndex,
      isIndex: true,
      isLayout: false,
      path: '/index',
    })
  }
  if (!hasUserFallback) {
    extraRoutes.push({
      ...pageDefaults,
      component: () => DefaultFallback,
      isFallback: true,
      isLayout: false,
      path: '/_fallback',
    })
  }
  if (extraRoutes.length) {
    return [...routes, ...buildRoutes(extraRoutes)]
  }
  return routes
}

const componentIndexesRegisterTarget = routes => {
  const indexes = routes.filter(x => x.isIndex)
  for (const index of indexes) {
    const route = routes.find(x => x.path + '/index' === index.path)
    if (!route) continue
    route.svench.customIndex = index
    index.svench.registerTarget = route
    index.registerTarget = route // DEBUG remove
    index.regex = index.regex.replace('(/index)?', '/index')
  }
  return routes
}

const addSvenchNode = node => {
  node.svench = {
    get title() {
      return this.node && this.node.title
    },
    ...node.svench,
  }
  return node
}

// NOTE default index and fallback don't use user's _layout because it's
// technically difficult (layouts are processed at compile time by Routify),
// and it's not high value (even possibly better -- default index and fallback
// can be thought as being one level above root)
export const augmentRoutes = pipe(
  routes => routes.map(addSvenchNode),
  addDefaultIndexAndFallback,
  componentIndexesRegisterTarget,
  prependLayouts(App, RenderLayout)
)
