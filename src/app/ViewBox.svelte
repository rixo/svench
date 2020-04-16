<script>
  import Prism from '../Prism.svelte'

  export let ui
  export let name
  export let source
  export let href
  export let options
  export let error = null

  $: ({ outline, centered, padding } = options)

  let showSource = null

  const toggleSource = () => {
    showSource = !showSource
  }
</script>

<div
  class="svench view box"
  class:ui
  class:flex={!ui}
  class:outline
  class:centered
  class:padding>
  {#if ui}
    <h3 class="svench view">
      <div class="toolbar">
        {#if source}
          <button class="code" on:click={toggleSource}>{'</>'}</button>
        {/if}
      </div>
      <a {href}>
        <span class="icon">◇</span>
        {name}
      </a>
    </h3>
    {#if showSource}
      <Prism code={source} />
    {/if}
  {/if}
  <div class="svench view canvas">
    <div class="svench view outline">
      {#if error}
        <pre>{error}</pre>
      {:else}
        <slot />
      {/if}
    </div>
  </div>
</div>

<style>
  h3 {
    margin: 0;
    padding: 0;
  }
  h3 a {
    display: block;
    padding: 0.33rem 1rem;
    padding-left: 0.5rem;
    text-decoration: none;
    opacity: 0.95;
  }
  h3 a[href]:hover {
    opacity: 1;
  }
  h3 a,
  h3 a * {
    background: var(--secondary, #aaa);
    color: var(--secondary-r, #fff);
  }

  h3 a .icon {
    display: inline-block;
    width: 1.5rem;
    text-align: center;
  }

  .box.ui {
    border-bottom: 1px solid var(--secondary);
    /* margin-bottom: -1px; */
  }

  .box.flex {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .box.flex.centered .canvas {
    margin: auto;
  }

  .box {
    background-color: #fff;
  }
  .box.centered .canvas {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .box.padding .canvas {
    padding: 1rem;
  }
  .box.outline .outline {
    display: inline-block;
    overflow: visible;
    position: relative;
  }
  .box.outline .outline:before {
    content: ' ';
    display: block;
    border: 2px solid magenta;
    position: absolute;
    z-index: 1;
    left: -2px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    pointer-events: none;
  }

  h3 {
    position: relative;
  }
  .toolbar {
    position: absolute;
    right: 0;
    z-index: 1;
  }
  .toolbar button {
    background: none;
    border: none;
    font-weight: bold;
    color: #fff;
    border: 2px solid;
    border-radius: 2px;
    padding: 0.1em 0.2em;
    margin: 0.2em 0.5rem;
    opacity: 0.9;
  }
  .toolbar button:hover {
    cursor: pointer;
    opacity: 1;
  }
  button.code {
    font-family: 'Fira Code';
  }
</style>
