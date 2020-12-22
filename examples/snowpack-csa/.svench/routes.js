/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */
import { hotRoutes } from 'svench'

import * as routes from './tmp/routes.js'

export default hotRoutes(import.meta.hot, routes)
