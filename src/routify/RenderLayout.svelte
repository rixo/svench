<!-- <script>
  import { writable } from 'svelte/store'
  import { route } from '@sveltech/routify'
  import { getContext, updateContext } from '../util'

  const { viewRegisters, options } = getContext()

  const register = (...args) => viewRegisters[$route.path](...args)

  let index = 0

  let timeout
  const reset = () => {
    index = 0
  }

  const getRenderName = name => {
    clearTimeout(timeout)
    timeout = setTimeout(reset, $options.renderTimeout)
    return name == null ? $options.defaultViewName(++index) : name
  }

  // --- view ---

  const getView = () => new URLSearchParams(window.location.search).get('view')

  const view = writable()

  $: $view = getView($route) || true

  // --- register ---

  const register = (...args) => viewRegisters[$route.path](...args)

  // --- context ---

  updateContext({ render: view, register, getRenderName })
</script> -->

<slot />
