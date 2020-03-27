<script>
  export let error = null

  export let title = null
  export let href = null
</script>

{#if error}
  <h2 class="error">Error!</h2>
  <pre>{error.stack || error}</pre>
{:else}
  {#if title != null}
    <h2>
      <a {href}>{title}</a>
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
    padding: 0.5rem 1rem;
    background-color: var(--tertiary);
    color: var(--tertiary-r);
    opacity: 0.95;
  }
  h2 a {
    text-decoration: none;
  }
  h2 a:hover {
    opacity: 1;
  }
</style>
