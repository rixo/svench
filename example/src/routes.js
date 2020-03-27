/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */

import { writable } from 'svelte/store'
import { routes as source, _tree } from '@sveltech/routify/tmp/routes'

const hotData = (import.meta.hot && import.meta.hot.data) || {}

export const routes = hotData.routes || writable([])

routes.set(source)

// console.log(
//   JSON.stringify(
//     source.map(x => x.meta),
//     false,
//     2
//   )
// )

if (import.meta.hot) {
  import.meta.hot.dispose(data => {
    data.routes = routes
  })
  // stop the update bubble before it reaches main.js
  import.meta.hot.accept()
}
