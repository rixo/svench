<script>
  import { getContext, updateContext, constStore } from './util'

  const { options } = getContext()

  export let route

  // --- getRenderName ---

  let index = 0

  let timeout
  const reset = () => {
    index = 0
  }

  const getRenderName = name => {
    clearTimeout(timeout)
    timeout = setTimeout(reset, $options.renderTimeout)
    index++
    return name == null ? $options.defaultViewName(index) : name
  }

  const route$ = constStore(route)

  updateContext({ getRenderName, route$, defaultRenderSrc: route$ })
</script>

<slot />
