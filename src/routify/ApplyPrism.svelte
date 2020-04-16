<script>
  import { onMount } from 'svelte'

  onMount(() => {
    if (typeof Prism === 'undefined') return
    // eslint-disable-next-line no-undef
    Prism.highlightAll()
  })
</script>

<!-- NOTE
     unfortunately a wrapper is needed, otherwise Prism leaks is UI elements
     into the parent (that is, the canvas), and they're never cleaned away -->

<div class="svench prism">
  <slot />
</div>

<style>
  div {
    flex: inherit;
    display: inherit;
    flex-direction: inherit;
  }
</style>
