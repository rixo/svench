<script>
  import { getContext, updateContext, makeNamer, constStore } from './util'

  const { options } = getContext()

  export let route

  const getRenderName = makeNamer(() => $options)

  const route$ = constStore(route)

  updateContext({ getRenderName, route$, defaultRenderSrc: route })
</script>

<slot />
