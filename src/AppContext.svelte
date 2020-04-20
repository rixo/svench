<script>
  import { writable } from 'svelte/store'
  import { getContext, updateContext } from './util.js'

  export let component

  const {
    router,
    router: { current },
    options,
    tree,
  } = getContext()

  const currentRoute = writable(null)

  $: focus = $current && $current.view !== null

  updateContext({ currentRoute })
</script>

<svelte:component this={component} {options} {tree} {router} {focus}>
  <slot />
</svelte:component>
