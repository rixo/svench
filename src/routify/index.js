import { buildRoutes } from '@sveltech/routify/runtime/buildRoutes'

import { pipe } from '../util'
import App from '../app/App.svelte'

import RenderLayout from './RenderLayout.svelte'
import DefaultIndex from './DefaultIndex.svelte'
import DefaultFallback from './DefaultFallback.svelte'

const renderLayout = {
  component: () => RenderLayout,
  path: '../../_layout',
  svench: {},
}

const appLayout = {
  component: () => App,
  path: '../_layout',
  svench: {},
}

const prependLayouts = (...layouts) => routes =>
  routes.map(({ layouts: currentLayouts, ...route }) => ({
    ...route,
    layouts: [...layouts, ...currentLayouts],
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
      component: () => DefaultIndex,
      isIndex: true,
      path: '/index',
      layouts: [],
      meta: {},
      svench: {},
    })
  }
  if (!hasUserFallback) {
    extraRoutes.push({
      component: () => DefaultFallback,
      isFallback: true,
      isLayout: false,
      path: '/_fallback',
      layouts: [],
      meta: {},
      svench: {},
    })
  }
  if (extraRoutes.length) {
    return [...routes, ...buildRoutes(extraRoutes)]
  }
  return routes
}

const componentIndexesRegisterTarget = routes => {
  // NOTE excluding isIndex because we only want to catch files with `.index`
  // suffix, not real `/index.svench` files
  const indexes = routes.filter(x => x.isIndex && x.svench.isVirtualIndex)
  for (const index of indexes) {
    for (const route of routes) {
      if (route.path + '/index' === index.path) {
        index.registerTarget = route
        index.regex = index.regex.replace('(/index)?', '/index')
      }
    }
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
  prependLayouts(appLayout, renderLayout)
  // prependLayouts(appLayout)
)
