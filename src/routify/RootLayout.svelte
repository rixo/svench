<script>
  import { route } from '@sveltech/routify'
  import Key from 'svelte-key'
  import Render from '../Render.svelte'

  const getView = () => new URLSearchParams(window.location.search).get('view')

  $: view = getView($route) || true
</script>

<Key key={view}>
  <Render {view}>
    <slot />
  </Render>
</Key>
