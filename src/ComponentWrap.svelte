<script>
  export let raw
</script>

{#if raw}
  <slot />
{:else}
  <!-- NOTE we do need a wrapping element that is destroyed on change, or
       offscreen will leak all other the place -->
  <svench-component>
    <slot />
  </svench-component>
{/if}

<style>
  svench-component {
    flex: inherit;
    display: inherit;
    flex-direction: inherit;
  }
</style>
