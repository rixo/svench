<script>
  export let store

  let _data
  export { _data as data }

  $: isStore = store && typeof store.subscribe === 'function'

  $: data = isStore ? $store : _data

  $: proxy = isStore
    ? new Proxy(
        {},
        {
          get(_, prop) {
            return $store[prop]
          },
          set(_, prop, value) {
            $store[prop] = value
            return true
          },
        }
      )
    : new Proxy(_data, {
        get(_, prop) {
          return _[prop]
        },
        set(_, prop, value) {
          _[prop] = value
          return true
        },
      })

  $: {
    $store
    proxy = proxy
  }
</script>

<slot {data} {proxy} />
