const notify = () => {
  for (const cb of callbacks) {
    cb()
  }
}

if (typeof window !== 'undefined' && window.__SVELTE_HMR) {
  window.__SVELTE_HMR.on('afterupdate', notify)
} else if (import.meta.hot && import.meta.hot.afterUpdate) {
  import.meta.hot.afterUpdate(notify)
}

const callbacks = []

export default callback => {
  callbacks.push(callback)
}
