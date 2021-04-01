<script>
  import { tick } from 'svelte'
  import ComponentContext from './ComponentContext.svelte'
  import RouterError from './RouterError.svelte'
  import { getContext, shallowEquals } from './util.js'

  export let scrollNav

  // bind:focus
  export let focus

  const { busy, router, Fallback } = getContext()

  const { current, error } = router

  // prettier-ignore
  $: ({
    fallback,
    route,
    route: { options: { page = true } = {} } = {},
    cmp,
    view,
  } = $current || {})

  $: focus = !fallback && view !== null

  let last
  $: if (!shallowEquals($current, last)) {
    last = $current
    if ($current) {
      tick().then(scrollNav($current))
    }
  }

  $: props = { page, route, focus }

  busy.trackUpdate()
</script>

{#if $error}
  <RouterError error={$error} />
{:else if $current}
  {#key $current}
    {#if fallback}
      <ComponentContext {...props}>
        <svelte:component this={Fallback} {route} />
      </ComponentContext>
    {:else if cmp}
      <ComponentContext {...props} component={cmp} {view} />
    {/if}
  {/key}
{/if}
