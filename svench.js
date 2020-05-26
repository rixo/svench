import Svench from './src/Svench.svelte'
import { App, RenderBox, ViewBox } from './src/app'
import './themes/default.css.js'
// import './themes/default.css'

const app = new Svench({
  target: document.body,
  props: {
    ui: () => ({ App, RenderBox, ViewBox }),
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })

  import.meta.hot.accept()
}
