import { buildRoutes } from '@sveltech/routify/runtime/buildRoutes'
import { get } from 'svelte/store'

import { pipe, getContext, updateContext } from '../util'
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

const updateChildrenPath = (node, oldPath, oldShortPath) => {
  if (!node.children) return
  if (node.path === oldPath && node.shortPath === oldShortPath) return
  for (const child of node.children) {
    const { path, shortPath } = child
    child.path = node.path + path.slice(oldPath.length)
    if (shortPath) {
      child.shortPath = node.shortPath + shortPath.slice(oldShortPath.length)
    }
    updateChildrenPath(child, path, shortPath)
  }
}

const removeSvenchSuffix = node => {
  const { path, shortPath } = node
  if (!path) return
  node.path = path.replace(/\.svench$/, '')
  if (node.path === path) return
  if (shortPath) node.shortPath = path.replace(/\.svench$/, '')
  updateChildrenPath(node, path, shortPath)
}

const replaceDots = path => path.replace(/\./g, '/')

const transformDots = (node, parent) => {
  const { path, shortPath } = node
  if (!path) return
  const parts = path.split('.')
  node.extraNesting = parts.length - 1
  node.svench.extraNesting = node.extraNesting
  if (parts.length < 2) return
  node.path = parts.join('/')
  if (node.path !== path && !parent.root) {
    console.log(parent)
    debugger
  }
  if (!shortPath) return
  node.shortPath = replaceDots(shortPath)
}

// Child.sub.svench <=> Child/sub.svench
const transformDotDelimiters = routes =>
  routes.map(route => {
    const { path, shortPath } = route
    return Object.assign(route, {
      ...route,
      extraNesting: path.split('.').length - 1,
      path: replaceDots(path),
      shortPath: replaceDots(shortPath),
    })
  })

const extractSortKey = node => {
  const { path } = node
  node.svench.sortKey = node.path || ''
  if (!path) return
  const match = /(?:^|\/)([\d-]+)[^\/]*$/.exec(path)
  if (match) {
    const [, order] = match
    node.svench.sortKey = order
  }
  node.path = path.replace(/(^|\/)[\d-]+/g, '$1')
  return node
  // return Object.assign(route, {
  //   ...route,
  //   extraNesting: path.split('.').length - 1,
  //   path: path.replace(/^[\d-]/, ''),
  //   shortPath: shortPath.replace(/^[\d-]/, ''),
  // })
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
  const indexes = routes.filter(x => !x.isIndex && x.path.endsWith('/index'))
  for (const index of indexes) {
    for (const route of routes) {
      if (route.path + '/index' === index.path) {
        debugger
        index.registerTarget = route
      }
    }
  }
  return routes
}

const customComponentIndex = routes => {
  const suffix = '.index'
  const indexes = routes.filter(x => !x.isIndex && x.path.endsWith(suffix))
  for (const index of indexes) {
    const cmpPath = index.path.slice(0, -suffix.length)
    for (const route of routes) {
      if (route.path === cmpPath) {
        routes.splice(routes.indexOf(index), 1)

        // index.registerTarget = route
        // route.svench.renderSrc = route

        const getComponent = route.component
        const getIndex = index.component
        // route.component = async () =>
        //     debugger
        //     return new RouteCustomIndex({
        //       ...options,
        //       props: {
        //         ...options.props,
        //         getIndex,
        //         getComponent,
        //         componentRoute: route,
        //       },
        //     })
        //   }
        // eslint-disable-next-line
        route.component = async (...args) => {
            const { render, breakIsolate, ['<Render>']: isRender } = getContext()
            const $render = get(render)
            if ($render === true && !isRender && !breakIsolate) {
              updateContext({
                defaultRenderSrc: route,
              })
              return getIndex(...args)
            } else {
              return getComponent(...args)
            }
        }
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

const addSegment = node => {
  if (!node.path) return
  node.segment = node.path.split('/').pop()
}

const clone = x => ({ ...x })

const walk = (prop, ...fns) => {
  const enter = (node, parent, tree) => {
    for (const fn of fns) {
      fn(node, parent, tree)
    }
    if (node[prop]) {
      for (const child of node[prop]) {
        enter(child, node, tree)
      }
    }
    return node
  }
  return root => {
    for (const node of root[prop]) {
      enter(node, root, root)
    }
    return root
  }
}

// NOTE default index and fallback don't use user's _layout because it's
// technically difficult (layouts are processed at compile time by Routify),
// and it's not high value (even possibly better -- default index and fallback
// can be thought as being one level bellow root)
export const augmentRoutes = pipe(
  // clone,
  // walk('children', addSvenchNode, removeSvenchSuffix, transformDots),
  // walk('children', addSvenchNode),
  // walk('children', extractSortKey, addSegment),
  // buildClientTree,
  // tree => buildRoutes(tree.children),
  // transformDotDelimiters,
  routes => routes.map(addSvenchNode),
  addDefaultIndexAndFallback,
  customComponentIndex,
  // componentIndexesRegisterTarget,
  prependLayouts(appLayout, renderLayout)
  // prependLayouts(appLayout)
)
