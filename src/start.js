import Svench from './Svench.svelte'

const apps = []

const start = (options, target = document.body) => {
  const app = new Svench({
    target,
    props: {
      // import is dynamic to avoid loading it unnecessarily if it is replaced
      // by user, but it should be recommended to load it sync
      ui: () => import('./app/index.js'),
      // ui: () => ({ App, RenderBox, ViewBox }),
      ...options,
    },
  })
  apps.push(app)
  return app
}

requestAnimationFrame(() => {
  if (apps.length > 0) return
  start()
})

// recreate the whole app(s) if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const app of apps) {
      app.$destroy()
    }
  })

  import.meta.hot.accept()
}

export default start
