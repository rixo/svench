<script>
  import { findCurrentItem } from './Menu.util.js'
  import MenuItems from './MenuItems.svelte'

  export let tree
  export let router
  export let autofold = false

  const { current } = router

  $: sections = tree.children

  $: route = $current && $current.route

  $: activeItem =
    route && $current && !$current.view && findCurrentItem(route, sections)
</script>

<div class="svench-menu">
  {#each sections as { id, path, title, children: items, href } (id)}
    {#if path !== '/_'}
      <h2 class:svench-menu-active={activeItem && id === activeItem.id}>
        {#if (href = router.resolve(path))}
          <a {href}>{title}</a>
        {:else}
          <span>{title}</span>
        {/if}
      </h2>
    {/if}
    <MenuItems {router} {items} {autofold} />
  {/each}
</div>

<style>
  .svench-menu {
    --svench-menu-expand-handle-color: var(--svench-text-accent);
    --icon-size: var(--svench-menu-icon-size, 1);
    --font-size: var(--svench-menu-font-size, 1em);
  }
  .svench-menu :global(*) {
    color: var(--light-2-r);
    font-size: var(--font-size);
  }
  h2 {
    margin: 0;
    padding: 0.25em;
  }
  h2 > span,
  h2 > a {
    display: block;
    color: var(--gray-dark);
    margin-bottom: 0;
    /* text-transform: capitalize; */
    opacity: 0.9;
  }
  h2 > a {
    text-decoration: none;
  }
  h2 > a:hover {
    opacity: 1;
  }

  /* --- active --- */
  h2 {
    position: relative;
  }
  .svench-menu :global(ul li.svench-menu-active > .text:before),
  h2.svench-menu-active:before {
    content: ' ';
    display: block;
    position: absolute;
    left: -0.5em;
    right: -0.5em;
    top: 0;
    bottom: 0;
    background-color: var(--gray);
    opacity: 0.3;
  }
</style>
