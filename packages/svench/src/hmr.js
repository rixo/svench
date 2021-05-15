const beforeListeners = new Set()
const afterListeners = new Set()

export const beforeHmr = fn => {
  beforeListeners.add(fn)
  return () => {
    beforeListeners.delete(fn)
  }
}

export const afterHmr = fn => {
  afterListeners.add(fn)
  return () => {
    afterListeners.delete(fn)
  }
}

if (typeof window !== 'undefined') {
  const init = () => {
    window.__SVELTE_HMR.on('beforeupdate', () => {
      for (const fn of beforeListeners) {
        fn()
      }
    })
    window.__SVELTE_HMR.on('afterupdate', () => {
      for (const fn of afterListeners) {
        fn()
      }
    })
  }
  if (window.__SVELTE_HMR) {
    init()
  } else {
    window.addEventListener('svelte-hmr:ready', init)
  }
}
