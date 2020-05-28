<script>
  export let raw
  export let focus
  export let page
</script>

{#if raw}
  <slot />
{:else}
  <!-- NOTE we do need a wrapping element that is destroyed on change, or
       offscreen will leak all other the place -->
  <svench-component
    class:svench-focus={focus}
    class:svench-page={!focus && page}>
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
