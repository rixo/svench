<script>
  import Render from '../Render.svelte'
  import { getContext } from '../util.js'

  const { route } = getContext()
</script>

<Render src={route.path + '/*'} />
