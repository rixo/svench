import start from './src/start.js'

// import app / ui sync
import * as ui from './src/app'

import './themes/default.css.js'
import './themes/default-markdown.css.js'
// import './themes/default.css'
// import './themes/default-markdown.css'

start({ ui }, import.meta.hot)
