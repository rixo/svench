<script>
  import Unique from 'svelte-key'
  import ComponentContext from './ComponentContext.svelte'
  import { updateContext } from './util.js'

  export let router

  const { current, error } = router

  updateContext({ route: $current && $current.route })
</script>

{#if $error}
  <h2>Error: failed to load component</h2>
  <pre>{$error}</pre>
{:else if $current && $current.cmp}
  <Unique key={$current}>
    <ComponentContext
      route={$current.route}
      component={$current.cmp}
      view={$current.view} />
  </Unique>
{/if}
