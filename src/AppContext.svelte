<script>
  import { writable } from 'svelte/store'
  import { getContext, updateContext } from './util.js'

  export let App
  export let focus

  const { router, options, tree, extras } = getContext()

  const currentRoute = writable(null)

  updateContext({ currentRoute })
</script>

<svelte:component this={App} {options} {tree} {router} {focus} extras={$extras}>
  <slot />
</svelte:component>
