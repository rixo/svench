<script>
  import { onMount } from 'svelte'

  onMount(() => {
    if (typeof Prism === 'undefined') return
    requestAnimationFrame(() => {
      // eslint-disable-next-line no-undef
      Prism.highlightAll()
    })
  })
</script>

<slot />
