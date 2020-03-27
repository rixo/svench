<script>
  import { getContext } from '../util.js'
  import RenderLayoutView from './RenderLayoutView.svelte'

  const { route$, render } = getContext()

  let decorator

  const Decorator = function(opts) {
    return (decorator = new RenderLayoutView(opts))
  }

  $: if (decorator) {
    decorator.$set({ key: $route$.path + '?' + $render })
  }
</script>

<slot decorator={Decorator} />
