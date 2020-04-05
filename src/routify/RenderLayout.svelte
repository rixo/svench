<script>
  import UniqueBy from 'svelte-key'
  import { leftover } from '@sveltech/routify'
  import { getContext } from '../util.js'

  const { route$, render } = getContext()

  $: key = $route$ && [$route$.path, $leftover, $render].join('_:')
</script>

<UniqueBy {key}>
  <slot />
</UniqueBy>
