import Svench from './Svench.svelte'

const start = (options, target = document.body, hot) => {
  if (target && !(target instanceof Element)) {
    hot = target
    target = document.body
  }

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

  // recreate the whole app(s) if an HMR update touches this module
  if (hot) {
    hot.dispose(() => {
      app.$destroy()
    })

    hot.accept()
  }

  return app
}

export default start
