import Svench from './Svench.svelte'

const applyRc = options => {
  const { rc } = options
  if (!rc) return options
  switch (typeof rc.options) {
    case 'function':
      return rc.options(options)
    case 'object':
      return { ...options, ...rc.options }
  }
  return options
}

const start = (options, target = document.body, hot) => {
  if (target && !(target instanceof Element)) {
    hot = target
    target = document.body
  }

  options = applyRc(options)

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

  // TODO Rollup: default routes
  // // feat: support for custom routes.js
  // // -- user default routes.js, if not provided
  // if (!options.routes) {
  //   import('../routes.js')
  //     .then(({ default: routes }) => {
  //       app.$set({ routes })
  //     })
  //     .catch(err => {
  //       console.error('Failed to load routes.js', err)
  //     })
  // }

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
