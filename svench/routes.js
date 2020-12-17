/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */
import { writable } from 'svelte/store'

import { routes, tree } from './tmp/routes.js'

const hotData = (import.meta.hot && import.meta.hot.data) || {}

const routes$ = hotData.routes || writable([])

routes$.set({ routes, tree })

export default routes$

if (import.meta.hot) {
  import.meta.hot.dispose(data => {
    data.routes = routes$
  })
  // stop the update bubble
  import.meta.hot.accept()
}
