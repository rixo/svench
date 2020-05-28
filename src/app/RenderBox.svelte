<script>
  export let error = null

  export let title = null
  export let href = null
</script>

{#if error}
  <h2 class="svench-renderbox-title svench-ui svench-error">Error!</h2>
  <pre class="svench-renderbox-error svench-ui">{error.stack || error}</pre>
{:else}
  {#if title != null}
    <h2 class="svench-renderbox-title svench-ui">
      <a {href}>
        <span class="icon">❖</span>
        {title}
      </a>
    </h2>
  {/if}

  <slot />
{/if}
