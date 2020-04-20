<script>
  import Unique from 'svelte-key'
  import ComponentContext from './ComponentContext.svelte'
  import RouterError from './RouterError.svelte'
  import { getContext } from './util.js'

  const { router, Fallback } = getContext()

  const { current, error } = router

  $: ({ fallback, route, cmp, view } = $current || {})
</script>

{#if $error}
  <RouterError error={$error} />
{:else if $current}
  <Unique key={$current}>
    {#if fallback}
      <ComponentContext {route}>
        <svelte:component this={Fallback} {route} />
      </ComponentContext>
    {:else if cmp}
      <ComponentContext {route} component={cmp} {view} />
    {/if}
  </Unique>
{/if}
