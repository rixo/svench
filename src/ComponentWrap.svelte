<script>
  export let raw
  export let focus
</script>

{#if raw}
  <slot />
{:else}
  <!-- NOTE we do need a wrapping element that is destroyed on change, or
       offscreen will leak all other the place -->
  <svench-component class:svench-focus={focus} class:svench-page={!focus}>
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
