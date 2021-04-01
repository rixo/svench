const callbacks = []

const notify = () => {
  for (const cb of callbacks) {
    cb()
  }
}

// NOTE needs to wait before "install" that at least one Svelte component has
// been loaded, otherwise svelte-hmr might not have initialized yet
const installIfNeeded = () => {
  if (typeof window !== 'undefined' && window.__SVELTE_HMR) {
    window.__SVELTE_HMR.on('afterupdate', notify)
  }
}

export const onHmr = callback => {
  installIfNeeded()
  callbacks.push(callback)
}
