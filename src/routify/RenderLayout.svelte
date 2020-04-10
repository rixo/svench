<script>
  import UniqueBy from 'svelte-key'
  import { leftover } from '@sveltech/routify'
  import { getContext } from '../util.js'
  import RenderOffscreen from '../RenderOffscreen.svelte'
  import ApplyPrism from './ApplyPrism.svelte'

  const { route$, render, focus: focus$ } = getContext()

  $: focus = $focus$

  $: key = $route$ && [$route$.path, $leftover, $render].join('_:')
</script>

<RenderOffscreen {focus}>
  <UniqueBy {key}>
    <ApplyPrism>
      <slot />
    </ApplyPrism>
  </UniqueBy>
</RenderOffscreen>
