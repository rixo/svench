import { start } from "svench"

import "svench/themes/default.css.js"
import "svench/themes/default-markdown.css.js"

const options = {}

import routes from "./routes.hot.js"
options.routes = routes

import * as ui from "svench/src/app/index.js"
options.ui = ui

start(options, import.meta.hot)

// Some tools (e.g. Vite, Snowpack) do static code analysis and need
// to see this to enable HMR
if (false) import.meta.hot.accept()