<script>
  import { findCurrentItem } from './Menu.util.js'
  import MenuItems from './MenuItems.svelte'
  import { sectionPrefix } from '../constants.js'

  export let tree
  export let router
  export let autofold = false

  const { current } = router

  const splitSections = tree => {
    const items = tree && tree.children
    if (!items) return items
    let sectionItem
    const rootItems = items.filter(x => {
      if (x.path === sectionPrefix) {
        sectionItem = x
        return false
      }
      return true
    })
    const sections = [
      {
        ...tree,
        children: rootItems,
      },
    ]
    if (sectionItem) {
      for (const route of sectionItem.children) {
        sections.push(route)
      }
    }
    return sections
  }

  $: sections = splitSections(tree) || []

  $: route = $current && $current.route

  $: activeItem =
    route && $current && !$current.view && findCurrentItem(route, sections)
</script>

<div class="svench-menu">
  {#each sections as s (s.id)}
    {#if !s.isRoot}
      <h2 class:svench-menu-active={activeItem && s.id === activeItem.id}>
        {#if (s.href = router.resolve(s.path))}
          <a href={s.href}>{s.title}</a>
        {:else}
          <span>{s.title}</span>
        {/if}
      </h2>
    {/if}
    <MenuItems {router} items={s.children} {autofold} />
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
    padding: 0.25em 0.5em;
  }
  h2 + h2 {
    margin-top: 0.75em;
  }
  h2 > span,
  h2 > a {
    display: block;
    color: var(--gray-dark);
    margin-bottom: 0;
    /* text-transform: capitalize; */
    opacity: 0.9;
  }
  .svench-menu h2 > a {
    font-size: 125%;
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
    left: -0.5rem;
    right: -0.5rem;
    top: 0;
    bottom: 0;
    background-color: var(--gray);
    opacity: 0.3;
  }
</style>
