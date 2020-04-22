<script>
  import { setContext } from './util.js'

  export let context
  export let Component

  setContext(context)
</script>

<svelte:component this={Component} />
