<script>
  import { route, leftover, isActive } from '@sveltech/routify'
  import { slide } from 'svelte/transition'
  import MenuViewsList from './MenuViewsList.svelte'
  import { getContext } from '../util'

  const { render } = getContext()

  export let items = []
  export let indent = 0

  const indentWidth = 1.2

  const expanded = {}

  const toggle = item => {
    expanded[item.id] = !expanded[item.id]
  }

  const expandFolders = items =>
    items.forEach(({ id, isPage }) => {
      if (expanded[id] == null) {
        expanded[id] = !isPage
      }
    })

  // $: expandFolders(items)

  $: isActiveItem = item =>
    $render === true &&
    ($route.path === item.path ||
      (item.registerTarget && item.registerTarget.path === $route.path) ||
      $leftover === item.path)

  const _isActive = item => {
    return (
      $isActive(item.path, false) ||
      (item.registerTarget && $isActive(item.registerTarget.path, false))
    )
  }

  let isExpanded
  $: {
    $route,
      (isExpanded = item =>
        _isActive(item) ||
        $leftover === item.path ||
        $leftover.startsWith(item.path + '/') ||
        // for:
        //     /nested/index.svench
        //     /nested/default_index/Foo.svench
        $leftover === item.path.replace(/\/index(?:\/|$)/, '') ||
        $leftover.startsWith(item.path.replace(/\/index(?:\/|$)/, '') + '/'))
  }
</script>

<ul class:nested={indent > 0}>
  {#each items as item (item.id)}
    <li class:active={isActiveItem(item)} class:expanded={isExpanded(item)}>
      <!-- <pre>{JSON.stringify(item, false, 2)}</pre> -->
      <a
        class="text"
        style={`padding-left: ${indent * indentWidth}rem`}
        href={item.path}>
        <span class="icon" class:expand={item.isDirectory}>
          <!-- {#if item.isDirectory}◆{:else}❖{/if} -->
          {#if item.isDirectory}▶{:else}❖{/if}
        </span>
        {item.title}
      </a>
      <!-- {#if $route.path === item.path} -->
      {#if isExpanded(item)}
        <!-- {#if $isActive(item.path) || item.isDirectory} -->
        <!-- {#if $isActive(item.path) || (item.isDirectory && expanded[item.id])} -->
        {#if item.views$}
          <MenuViewsList
            {item}
            views={item.views$}
            active={$route.path === (item.registerTarget || item).path && $render}
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
    width: 18px;
    height: 18px;
  }

  /* li > .text > .expand.icon {
    display: inline-block;
    transform-origin: center;
  }
  li.expanded > .text > .expand.icon {
    transform: rotate(90deg);
  } */
</style>
