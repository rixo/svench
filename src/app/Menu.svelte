<script>
  export let items = []
  export let nested = false
</script>

<ul class="pages" class:nested>
  {#each items as it (it.id)}
    <li
      class:index={it.isIndex}
      class:directory={it.isDirectory}
      class:page={!it.isDirectory}>
      {#if it.isDirectory}
        <span class="icon folder-collapse-handle">⌄</span>
        <span class="icon">📁</span>
        {#if it.isIndex}
          <a class="text" href={it.shortPath}>{it.segment}</a>
        {:else}
          <span class="text">{it.segment}</span>
        {/if}
        <svelte:self items={it.children} nested />
      {:else}
        {#if it.views}
          <span class="icon folder-collapse-handle">⌄</span>
        {/if}
        <span class="icon">⚙️</span>
        <a class="text" href={it.path}>{it.segment}</a>
      {/if}
      {#if it.views}
        <ul class="nested">
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
  li > .folder-collapse-handle {
    top: 0.4em;
    margin-left: -40px;
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
    color: mediumpurple;
    color: #aaa;
    opacity: 0.5;
  }
  li > a.text {
    color: var(--light-1, skyblue);
  }
  li .icon {
    color: #aaa;
    opacity: 0.5;
  }
  li > a {
    display: inline-block;
    text-decoration: none;
  }
  li > a:hover {
    color: var(--primary);
  }
</style>
