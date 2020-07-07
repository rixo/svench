<script>
  import { findCurrentItem } from './Menu.util.js'
  import MenuViewsList from './MenuViewsList.svelte'

  export let router
  export let items = []
  export let indent = 0
  export let autofold

  const { current } = router

  const indentWidth = 1.2

  let expandLocks
  expandLocks = {}

  const toggle = item => {
    if (autofold) return
    // item in the active path can't be toggled (to show active item); if they
    // were, they would auto collapse when active item change, which is weird
    if (route.path.startsWith(item.path)) return
    expandLocks[item.id] = !expandLocks[item.id]
  }

  $: route = $current && $current.route

  $: activeItem =
    route && $current && !$current.view && findCurrentItem(route, items)

  $: expanded =
    route && $current
      ? Object.fromEntries(
          items
            .filter(
              item => expandLocks[item.id] || route.path.startsWith(item.path)
            )
            .map(x => [x.id, true])
        )
      : {}

  $: getActiveView = item => {
    if (!$current) return false
    if (!route) return false
    if (route.path !== item.path) return false
    return $current.view
  }

  const autoexpand = item => {
    expandLocks[item.id] = true
    // bug in svelte (3.23)? need to repeat the assignement for the `expanded`
    // reactive block to rerun
    requestAnimationFrame(() => {
      expandLocks[item.id] = true
    })
  }

  $: if (!autofold && activeItem) autoexpand(activeItem)

  const sorter = (a, b) => a.sortKey.localeCompare(b.sortKey)

  const sortTree = items => {
    items.sort(sorter)
    if (!items) return
    for (const item of items) {
      if (item.children) sortTree(item.children)
    }
    return items
  }

  $: _items = sortTree(
    items.map(x => ({
      ...x,
      href: router.resolve(x.path),
      isDirectory: !x.import,
    }))
  )

  const has = x => x && x.length > 0

  const renderIcon = ({ isDirectory, index, views, children }) =>
    isDirectory
      ? index
        ? has(children) || has(views)
          ? '🞛'
          : '◇'
        : has(children)
        ? '▶'
        : '▪'
      : has(children)
      ? '🞛'
      : has(views)
      ? '❖'
      : '◇'
</script>

{#if _items.length > 0}
  <ul class:nested={indent > 0}>
    {#each _items as item, i (item.path)}
      <li
        class:svench-menu-active={activeItem && item.id === activeItem.id}
        class:expanded={expanded[item.id]}>
        <a
          class="text"
          style={`padding-left: ${indent * indentWidth}em`}
          href={item.href}>
          <span
            class="svench-menu-item-icon svench-menu-item-expand-icon"
            class:expand={item.isDirectory && !item.index && has(item.children)}
            on:click|preventDefault={() => toggle(item)}>
            <span class="svench-menu-item-expand-icon-icon">
              {renderIcon(item)}
            </span>
          </span>
          <span class="svench-menu-item-text">{item.title}</span>
        </a>
        {#if expanded[item.id]}
          {#if item.views$}
            <MenuViewsList
              {router}
              {item}
              views={item.views$}
              active={getActiveView(item)}
              indent={indent + 1}
              {indentWidth} />
          {/if}
          {#if item.children}
            <svelte:self
              {router}
              {autofold}
              items={item.children}
              indent={indent + 1} />
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul,
  li {
    margin: 0;
    padding: 0;
  }
  ul {
    list-style: none;
  }
  ul:not(.nested) {
    padding: 0.25em 0.5em 0.75em;
  }
  ul :global(li .text) {
    position: relative;
    display: block;
    padding: 0.2em;
    white-space: nowrap;
  }
  ul :global(a) {
    text-decoration: none;
    opacity: 0.8;
  }
  ul :global(a:hover) {
    opacity: 1;
  }

  ul :global(.svench-menu-item-icon) {
    display: inline-block;
    text-align: center;
    width: 1.1em;
    height: 1.1em;
    transform: scale(var(--icon-size));
  }

  li
    > .text
    > .expand.svench-menu-item-icon
    .svench-menu-item-expand-icon-icon {
    display: inline-block;
    transform-origin: center;
    position: relative;
  }
  li.expanded
    > .text
    > .expand.svench-menu-item-icon
    .svench-menu-item-expand-icon-icon {
    left: 0.1em;
    top: 0.1em;
    transform: rotate(90deg);
  }

  .svench-menu-item-expand-icon {
    position: relative;
  }
  .svench-menu-item-expand-icon:hover .svench-menu-item-expand-icon-icon {
    color: var(--svench-menu-expand-handle-color);
  }
</style>
