<script>
  import MenuItems from './MenuItems.svelte'

  export let tree
  export let router
  export let autofold = false

  $: sections = tree.children
</script>

{#each sections as { id, path, title, children: items, href } (id)}
  {#if path !== '/_'}
    <h2>
      {#if href}
        <a {href}>{title}</a>
      {:else}
        <span>{title}</span>
      {/if}
    </h2>
  {/if}
  <MenuItems {router} {items} {autofold} />
{/each}

<style>
  h2 {
    margin: 0;
  }
  h2 > span,
  h2 > a {
    display: block;
    color: var(--gray-dark);
    margin: 0.5em;
    margin-bottom: 0;
    text-transform: capitalize;
    opacity: 0.9;
  }
  h2 > a {
    text-decoration: none;
  }
  h2 > a:hover {
    opacity: 1;
  }
</style>
