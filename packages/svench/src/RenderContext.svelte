<script>
  import { updateContext, constStore } from './util'

  export let route

  const route$ = constStore(route)

  updateContext({ route$, defaultRenderSrc: route })
</script>

<slot />
