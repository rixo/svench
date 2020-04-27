import Svench from './src/Svench.svelte'

// use preconfigured Prism bundle
import './prism.js'

const app = new Svench({ target: document.body })

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })

  import.meta.hot.accept()
}
