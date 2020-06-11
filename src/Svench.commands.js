import { onDestroy } from 'svelte'

const wrapStore = (store, onDispose = onDestroy) => {
  let $store

  onDispose(
    store.subscribe(x => {
      $store = x
    })
  )

  return new Proxy(store, {
    get(_, prop) {
      return $store[prop]
    },
    set(_, prop, value) {
      $store[prop] = value
      store.set($store)
      return true
    },
  })
}

export default ({ router, options }) => {
  const $options = wrapStore(options)

  const toggleMenu = () => {
    $options.menuVisible = !$options.menuVisible
  }

  const refresh = () => router.reroute()

  const toggleFullscreen = () => {
    $options.fullscreen = !$options.fullscreen
  }

  // const goRaw = () => {
  //   const sep = location.href.includes('?') ? '&' : '?'
  //   location.href = location.href + sep + 'only&raw'
  // }

  const goNaked = () => {
    const sep = location.href.includes('?') ? '&' : '?'
    location.href = location.href + sep + 'only&naked'
  }

  const goRawNaked = () => {
    const sep = location.href.includes('?') ? '&' : '?'
    location.href = location.href + sep + 'only&raw&naked'
  }

  return { toggleMenu, refresh, goNaked, goRaw: goRawNaked, toggleFullscreen }
}
