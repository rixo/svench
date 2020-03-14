<script>
  import { slide } from 'svelte/transition'

  export let items = []
  export let nested = false

  const collapsed = {}

  const toggle = item => {
    collapsed[item.id] = !collapsed[item.id]
  }
</script>

<ul class="pages" class:nested>
  {#each items as it (it.id)}
    <li
      class:index={it.isIndex}
      class:directory={it.isDirectory}
      class:collapsed={collapsed[it.id]}
      class:page={!it.isDirectory}>
      {#if it.isDirectory}
        <span class="icon folder-collapse handle" on:click={toggle(it)}>⌄</span>
        <span class="icon handle" on:click={toggle(it)}>📁</span>
        {#if it.isIndex}
          <a class="text" href={it.shortPath}>{it.segment}</a>
        {:else}
          <span class="text">{it.segment}</span>
        {/if}
        {#if !collapsed[it.id]}
          <svelte:self items={it.children} nested />
        {/if}
      {:else}
        {#if it.views}
          <span
            class="icon folder-collapse handle"
            on:click={() => (collapsed[it.id] = !collapsed[it.id])}>
            ⌄
          </span>
        {/if}
        <span
          class="icon handle"
          on:click={() => (collapsed[it.id] = !collapsed[it.id])}>
          ⚙️
        </span>
        <a class="text" href={it.path}>{it.segment}</a>
      {/if}
      {#if it.views && !collapsed[it.id]}
        <ul class="nested" transition:slide>
          {#each it.views as name}
            <li class="svench menu view">
              <span class="icon">🗈</span>
              <a class="text" href={it.path + `?view=${name}`}>{name}</a>
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ul>

<style>
  ul:not(.nested) {
    padding-left: 24px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding-left: 24px;
  }
  li {
    padding: 0;
    margin: 0.33em 0;
    position: relative;
  }
  li > .icon {
    color: #999;
    line-height: 0;
    position: absolute;
    width: 24px;
    top: 0.5em;
    margin-left: -24px;
    text-align: center;
    font-size: 16px;
  }
  .folder-collapse.handle {
    top: 0.4em;
    margin-left: -40px;
    cursor: pointer;
  }
  .collapsed > .folder-collapse.handle {
    top: 0.5em;
    transition: transform 120ms;
    transform-origin: center;
    transform: rotate(-90deg);
  }
  li.directory > .text {
    font-weight: 100;
  }
  li.page > .text {
    font-weight: 500;
  }
  li.view > .text {
    font-weight: normal;
    font-style: italic;
  }
  /* colors */
  li > .text:not(a) {
    color: #aaa;
    opacity: 0.75;
  }
  li > a.text {
    color: var(--light-1, skyblue);
  }
  li > .icon {
    color: #aaa;
    opacity: 0.75;
  }
  li > a {
    display: inline-block;
    text-decoration: none;
  }
  li > a:hover {
    color: var(--primary);
  }
  .handle {
    cursor: pointer;
  }
</style>
