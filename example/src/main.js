import {Svench} from 'svench'

import { routes } from '@sveltech/routify/tmp/routes'

const app = new Svench({
  target: document.body,
  props: {
    routes,
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })
  import.meta.hot.accept()
}
