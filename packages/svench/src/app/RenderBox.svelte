<script>
  export let error = null

  export let title = null
  export let href = null
</script>

<div class="svench-renderbox">
  {#if error}
    <h2 class="svench-renderbox-title svench-ui svench-error">Error!</h2>
    <pre class="svench-renderbox-error svench-ui">{error.stack || error}</pre>
  {:else}
    {#if title != null}
      <h2 class="svench-renderbox-title svench-ui">
        <a {href}>
          <span class="svench-renderbox-title-icon">❖</span>
          {title}
        </a>
      </h2>
    {/if}

    <div class="svench-renderbox-body">
      <slot />
    </div>
  {/if}
</div>
