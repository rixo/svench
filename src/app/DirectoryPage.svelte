<script>
  import Render from '../Render.svelte'

  export let route
</script>

<Render src={route.path + '/*'} />
