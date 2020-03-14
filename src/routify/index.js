import RootLayout from './RootLayout.svelte'
import DefaultIndex from './DefaultIndex.svelte'

const rootLayout = {
  component: () => RootLayout,
  path: '...',
}

const addRootLayout = routes =>
  routes.map(({ layouts, ...route }) => {
    return {
      ...route,
      layouts: [rootLayout, ...layouts],
    }
  })

const addDefaultIndex = routes => {
  const isUserIndex = r =>
    (r.isIndex && r.path === '/index') || r.shortPath === ''
    debugger
  const userIndexIndex = routes.findIndex(isUserIndex)
  if (userIndexIndex < 0) {
    const defaultIndex = {
      component: () => DefaultIndex,
      isIndex: true,
      path: '/index',
      shortPath: '',
      layouts: [],
      regex: "^(/index)?/?$",
      name: "/index",
      ranking: "C",
      params: {}
    }
    return [...routes, defaultIndex]
  }
  return routes
}

export const augmentRoutes = routes => {
  return addRootLayout(addDefaultIndex(routes))
}
