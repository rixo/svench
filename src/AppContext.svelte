<script>
  import { writable } from 'svelte/store'
  import { getContext, updateContext } from './util.js'

  export let component

  const {
    router: { current },
    options,
    tree,
  } = getContext()

  const currentRoute = writable(null)

  const focus$ = writable(false)

  $: focus = $current && $current.view !== null

  updateContext({
    currentRoute,
    focus$,
  })
</script>

<svelte:component this={component} {options} {tree} {focus}>
  <slot />
</svelte:component>
