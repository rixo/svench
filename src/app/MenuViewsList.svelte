<script>
  import { slide } from 'svelte/transition'

  export let item
  export let views
  export let indent
  export let indentWidth
  export let active

  $: path = (item.registerTarget || item).path
</script>

{#each $views as name}
  <li class:active={name === active}>
    <a
      class="text"
      style={`padding-left: ${indent * indentWidth}rem`}
      href={path + `?view=${name}`}>
      <span class="icon">◇</span>
      {name}
    </a>
  </li>
{/each}

<style>
  li {
    margin: 0;
    padding: 0;
  }
  /* .icon {
    position: absolute;
    margin-left: -16px;
  } */
</style>
