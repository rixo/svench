<script>
  import Unique from 'svelte-key'
  import ComponentContext from './ComponentContext.svelte'
  import RouterError from './RouterError.svelte'
  import RouterWrap from './RouterWrap.svelte'
  import { getContext, updateContext } from './util.js'

  export let router

  const { raw } = getContext()

  const { current, error } = router

  updateContext({ route: $current && $current.route })
</script>

{#if $error}
  <RouterError error={$error} />
{:else if $current && $current.cmp}
  <Unique key={$current}>
    <RouterWrap {raw}>
      <ComponentContext
        route={$current.route}
        component={$current.cmp}
        view={$current.view} />
    </RouterWrap>
  </Unique>
{/if}
