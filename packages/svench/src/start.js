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
    props: options,
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
