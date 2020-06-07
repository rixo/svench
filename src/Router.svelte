<script>
  import { tick } from 'svelte'
  import Unique from 'svelte-key'
  import ComponentContext from './ComponentContext.svelte'
  import RouterError from './RouterError.svelte'
  import { getContext, shallowEquals } from './util.js'

  export let scrollNav

  // bind:focus
  export let focus

  const { router, Fallback } = getContext()

  const { current, error } = router

  $: ({ fallback, route, cmp, view } = $current || {})

  $: focus = !fallback && view !== null

  let last
  $: if (!shallowEquals($current, last)) {
    last = $current
    if ($current) {
      tick().then(scrollNav($current))
    }
  }
</script>

{#if $error}
  <RouterError error={$error} />
{:else if $current}
  <Unique key={$current}>
    {#if fallback}
      <ComponentContext {route} {focus}>
        <svelte:component this={Fallback} {route} />
      </ComponentContext>
    {:else if cmp}
      <ComponentContext {route} {focus} component={cmp} {view} />
    {/if}
  </Unique>
{/if}
