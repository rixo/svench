<script>
  import { leftover } from '@sveltech/routify'
  import Render from '../Render.svelte'
</script>

<Render src={$leftover + '/**'} all />
