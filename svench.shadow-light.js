import Svench from './src/Svench.svelte'

const app = new Svench({
  target: document.body,
  props: {
    ui: () => import('./app.js'),
    lightUi: () => Promise.all([
      import('./src/app/index.js'),
      import('./prism.js')
    ]).then(([app]) => app),
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })

  import.meta.hot.accept()
}
