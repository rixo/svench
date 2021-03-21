<script>
  import MenuViewItemIcon from './MenuViewItemIcon.svelte'

  export let router
  export let item
  export let views
  export let indent
  export let indentWidth
  export let active

  $: path = (item.registerTarget || item).path
</script>

{#each $views as name}
  <li class:svench-menu-active={name === active}>
    <a
      class="text"
      style={`padding-left: ${indent * indentWidth}em`}
      href={router.resolveView(path, name)}>
      <MenuViewItemIcon class="svench-menu-item-icon" />
      <span class="svench-menu-item-text">{name}</span>
    </a>
  </li>
{/each}

<style>
  li {
    margin: 0;
    padding: 0;
  }
</style>
