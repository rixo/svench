<script>
  import MenuItems from './MenuItems.svelte'

  const defaultSectionName = ''
  const defaultSectionSortKey = '0000'

  export let tree
  export let autofold = false

  const splitSections = items => {
    const defaultSection = {
      path: '',
      name: defaultSectionName,
      sortKey: defaultSectionSortKey,
    }
    const sections = [defaultSection]
    defaultSection.items = items.filter(item => {
      if (!item.svench.section) return true
      sections.push({
        path: item.path,
        name: item.prettyName,
        items: item.children,
        sortKey: item.svench.sortKey || item.prettyName,
        href: item.children.some(x => x.isIndex) ? item.path : false,
      })
      return false
    })
    return sections.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }

  // $: sections = splitSections(tree.children)
  $: sections = [{ path: '', items: tree.children }]
</script>

{#each sections as { path, name, items, href } (path)}
  {#if name}
    <h2>
      {#if href}
        <a {href}>{name}</a>
      {:else}
        <span>{name}</span>
      {/if}
    </h2>
  {/if}
  <MenuItems {items} {autofold} />
{/each}

<style>
  h2 {
    margin: 0;
  }
  h2 > span,
  h2 > a {
    display: block;
    color: var(--gray-dark);
    margin: 0.5rem;
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
