<script>
  import { leftover, isActive } from '@sveltech/routify'
  import MenuViewsList from './MenuViewsList.svelte'
  import { getContext } from '../util'

  const { route$: route, render } = getContext()

  export let items = []
  export let indent = 0
  export let autofold = true

  const indentWidth = 1.2

  const expanded = {}

  const toggle = item => {
    if (autofold) return
    expanded[item.id] = !expanded[item.id]
  }

  $: _leftover = $leftover && `/${$leftover}`

  $: isActiveItem = item => {
    // guard: a view is selected but we're evaluating a page item
    if ($render !== true) return false
    return (
      $route.shortPath === (item.shortPath || item.path) ||
      (item.svench.registerTarget &&
        item.svench.registerTarget.shortPath === $route.shortPath) ||
      _leftover === item.path
    )
  }

  const _isActive = item =>
    !!(
      $isActive(item.path, false) ||
      (item.svench.registerTarget &&
        $isActive(item.svench.registerTarget.path, false))
    )

  let isExpanded
  $: {
    $route,
      (isExpanded = item =>
        expanded[item.id] ||
        _isActive(item) ||
        // for: _fallback
        _leftover === item.path ||
        _leftover.startsWith(item.path + '/') ||
        // for:
        //     /nested/index.svench
        //     /nested/default_index/Foo.svench
        $leftover === item.path.replace(/\/index(?:\/|$)/, '') ||
        $leftover.startsWith(item.path.replace(/\/index(?:\/|$)/, '') + '/'))
  }

  const updateNaturalExpanded = () => {
    if (autofold) return
    for (const item of items) {
      if (expanded[item.id]) continue
      if (!isExpanded(item)) continue
      expanded[item.id] = true
    }
  }

  $: isExpanded && updateNaturalExpanded()

  const sorter = (a, b) => a.svench.sortKey.localeCompare(b.svench.sortKey)

  const sortTree = items => {
    items.sort(sorter)
    if (!items) return
    for (const item of items) {
      if (item.children) sortTree(item.children)
    }
  }

  let _items
  $: {
    _items = []

    for (const item of items) {
      // guard: we already display dirs, we don't want to have an "index" entry
      if (item.isIndex) continue
      // guard: for component / custom index pairs, we only display component
      if (item.svench.registerTarget) continue

      const { svench } = item

      const _item = Object.assign(Object.create(item), {
        href: svench.customIndex ? svench.customIndex.path : item.path,
        views$: svench.views$,
        isDirectory: !item.isFile,
      })
      _items.push(_item)
    }

    sortTree(_items)
  }
</script>

{#if _items.length > 0}
  <ul class:nested={indent > 0}>
    {#each _items as item, i (item.svench.id)}
      <li class:active={isActiveItem(item)} class:expanded={isExpanded(item)}>
        <a
          class="text"
          style={`padding-left: ${indent * indentWidth}rem`}
          href={item.href}>
          <span
            class="icon"
            class:expand={item.isDirectory}
            on:click|preventDefault={toggle(item)}>
            {#if item.isDirectory}▶{:else}❖{/if}
          </span>
          {item.prettyName}
        </a>
        <!-- {#if $route.path === item.path} -->
        {#if isExpanded(item)}
          <!-- {#if $isActive(item.path) || item.isDirectory} -->
          <!-- {#if $isActive(item.path) || (item.isDirectory && expanded[item.id])} -->
          {#if item.views$}
            <MenuViewsList
              {item}
              views={item.views$}
              active={$route.shortPath === (item.svench.registerTarget || item).shortPath && $render}
              indent={indent + 1}
              {indentWidth} />
          {/if}
          {#if item.children}
            <svelte:self items={item.children} indent={indent + 1} />
          {/if}
        {/if}
        <!-- <span class="text">{item.title}</span> -->
        <!-- <pre>{$isActive(item.path)} -- {item.path}</pre> -->
        <!-- {#if item.children}
        <svelte:self items={item.children} indent={indent + 1} />
      {/if} -->
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul :global(*) {
    color: var(--light-2-r);
  }
  ul,
  li {
    margin: 0;
    padding: 0;
  }
  ul {
    list-style: none;
  }
  ul:not(.nested) {
    padding: 0.5rem;
  }
  /* ul:not(.nested) > :global(li .text) {
    padding-right: 8px;
    padding-left: 8px;
  } */
  ul :global(li .text) {
    position: relative;
    display: block;
    padding: 2px;
    white-space: nowrap;
  }
  ul :global(li.active > .text:before) {
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
  ul :global(a) {
    text-decoration: none;
    opacity: 0.8;
  }
  ul :global(a:hover) {
    opacity: 1;
  }

  ul :global(li .icon) {
    display: inline-block;
    text-align: center;
    width: 1.1rem;
    height: 1.1rem;
    /* border: 1px solid red; */
  }

  li > .text > .expand.icon {
    /* display: inline-block; */
    transform-origin: center;
    position: relative;
  }
  li.expanded > .text > .expand.icon {
    left: 0.1rem;
    top: 0.2rem;
    transform: rotate(90deg);
  }
</style>
