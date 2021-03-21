#### start(options, target = document.body)

`.svench/svench.js`

```js
import { start } from 'svench'

// when not using the default entry point (node_modules/svench/svench.js), then
// you need to include a Svench theme yourself
import 'svench/themes/default.css.js'

// your own theme
import './svench.css'

start({
  // pass Svench options
  backgrounds: ['red', 'green', 'blue'],
})
```
