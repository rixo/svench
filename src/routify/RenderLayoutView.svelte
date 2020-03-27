<script>
  import UniqueBy from 'svelte-key'

  export let key = null
</script>

{#if key !== null}
  <UniqueBy {key}>
    <slot />
  </UniqueBy>
{/if}
