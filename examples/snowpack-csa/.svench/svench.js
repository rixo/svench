import { start } from 'svench'

// import app / ui sync
import * as ui from 'svench/src/app'

import 'svench/themes/default.css'
import 'svench/themes/default-markdown.css'

import routes from './routes.js'

start({ ui, routes }, import.meta.hot)
