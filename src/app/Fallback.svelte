<script>
  import Render from '../Render.svelte'

  export let route

  $: src = route.path + '/*'
</script>

<Render {src} />
