<script>
  export let error = null

  export let title = null
  export let href = null
</script>

{#if error}
  <h2 class="svench-ui error">Error!</h2>
  <pre class="svench-ui">{error.stack || error}</pre>
{:else}
  {#if title != null}
    <h2 class="svench-ui">
      <a {href}>
        <span class="icon">❖</span>
        {title}
      </a>
    </h2>
  {/if}

  <div>
    <slot />
  </div>
{/if}

<style>
  /* .focus :global(> *) {
    display: none;
  }
  .focus :global(> .svench.view) {
    display: inherit;
  } */

  h2 {
    margin: 0;
    padding: 0;
  }
  h2.error,
  h2 a {
    font-size: 1.2em;
    display: block;
    padding: 0.5em 1em;
    padding-left: 0.5em;
    background-color: var(--tertiary);
    opacity: 0.95;
  }

  h2 a,
  h2 a * {
    color: var(--tertiary-r);
  }

  h2 a .icon {
    display: inline-block;
    width: 1.5em;
    text-align: center;
    font-weight: 100;
  }

  h2 a {
    text-decoration: none;
  }
  h2 a:hover {
    opacity: 1;
  }
</style>
