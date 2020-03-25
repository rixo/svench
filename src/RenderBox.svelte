<script>
  import RenderOffscreen from './RenderOffscreen.svelte'

  export let route
  export let title
  export let focus

  $: href = route ? route.path : null
</script>

{#if title != null}
  <h2>
    <a {href}>{title}</a>
  </h2>
{/if}

<div>
  <RenderOffscreen {focus}>
    <slot />
  </RenderOffscreen>
</div>

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
  h2 a {
    font-size: 1.2em;
    display: block;
    padding: 0.5rem 1rem;
    background-color: var(--tertiary);
    color: var(--tertiary-r);
    text-decoration: none;
    opacity: 0.95;
  }
  h2 a:hover {
    opacity: 1;
  }
</style>
