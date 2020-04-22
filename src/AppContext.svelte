<script>
  import { getContext } from './util.js'

  export let App
  export let focus

  const { router, options, tree, extras } = getContext()
</script>

<svelte:component this={App} {options} {tree} {router} {focus} extras={$extras}>
  <slot />
</svelte:component>
