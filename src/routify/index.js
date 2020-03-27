import { route as currentRoute } from '@sveltech/routify'
import { get } from 'svelte/store'

import { pipe } from '../util'
import App from '../app/App.svelte'

import RenderLayout from './RenderLayout.svelte'
import DefaultIndex from './DefaultIndex.svelte'
import DefaultFallback from './DefaultFallback.svelte'

const renderLayout = {
  component: () => RenderLayout,
  path: '../../_layout',
}

const appLayout = {
  component: () => App,
  path: '../_layout',
}

// Child.sub.svench <=> Child/sub.svench
const transformDotDelemiters = routes =>
  routes.map(route => {
    const { path, shortPath } = route
    return Object.assign(route, {
      ...route,
      extraNesting: path.split('.').length - 1,
      path: path.replace(/\./g, '/'),
      shortPath: shortPath.replace(/\./g, '/'),
    })
  })

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
      shortPath: '',
      layouts: [],
      regex: '^(/index)?/?$',
      name: '/index',
      ranking: 'C',
      params: {},
      meta: {},
    })
  }
  if (!hasUserFallback) {
    extraRoutes.push({
      component: () => DefaultFallback,
      isFallback: true,
      path: '/_fallback',
      shortPath: '',
      layouts: [],
      name: '/_fallback',
      ranking: 'A',
      params: {},
      meta: {},
    })
  }
  if (extraRoutes.length) {
    return [...routes, ...extraRoutes]
  }
  return routes
}

const rewireComponentIndexes = routes => {
  // NOTE excluding isIndex because we only want to catch files with `.index`
  // suffix, not real `/index.svench` files
  const indexes = routes.filter(x => !x.isIndex && x.path.endsWith('/index'))
  for (const route of routes) {
    for (const index of indexes) {
      if (route.path + '/index' === index.path) {
        index.registerTarget = route
      }
    }
  }
  return routes
}

const addSvenchNode = routes => {
  for (const route of routes) {
    route.svench = {
      get title() {
        return this.node && this.node.title
      },
      get sortKey() {
        const key = (this.node && this.node.sortKey) || route.segment
        return key
      },
    }
  }
  return routes
}

// NOTE default index and fallback don't use user's _layout because it's
// technically difficult (layouts are processed at compile time by Routify),
// and it's not high value (even possibly better -- default index and fallback
// can be thought as being one level bellow root)
export const augmentRoutes = pipe(
  transformDotDelemiters,
  addDefaultIndexAndFallback,
  addSvenchNode,
  rewireComponentIndexes,
  prependLayouts(appLayout, renderLayout)
  // prependLayouts(appLayout)
)
