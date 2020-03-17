import { Svench } from 'svench'

import { routes } from './routes.js'

const app = new Svench({
  target: document.body,
  props: {
    routes,
    defaults: {
      padding: true,
    },
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })
  import.meta.hot.accept()
}
