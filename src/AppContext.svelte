<script>
  import { writable } from 'svelte/store'
  import { getContext, updateContext } from './util.js'

  const {
    router: { current },
  } = getContext()

  const currentRoute = writable(null)

  const focus$ = writable(false)

  $: $focus$ = $current && $current.view !== null

  updateContext({
    currentRoute,
    focus$,
  })
</script>

<slot />
