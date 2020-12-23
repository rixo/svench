import { start } from "svench"

import "svench/themes/default.css"
import "svench/themes/default-markdown.css"

const options = {}

import routes from "./routes.hot.js"
options.routes = routes

import * as ui from "svench/src/app/index.js"
options.ui = ui

start(options, import.meta.hot)
