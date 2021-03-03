/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */
import { hotRoutes } from "svench"

import * as routes from "./routes.js"

export default hotRoutes(import.meta.hot, routes)

// Some tools (e.g. Vite, Snowpack) do static code analysis and need
// to see this to enable HMR
if (false) import.meta.hot.accept()