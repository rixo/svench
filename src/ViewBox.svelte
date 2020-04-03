<script>
  import { getContext } from './util.js'
  import ViewRenderError from './ViewRenderError.svelte'

  const { options, route$, emitViewBox } = getContext()

  $: ({ outline, centered, padding } = $options)

  $: route = $route$

  export let error = null

  export let ui = true
  export let name

  $: href =
    route && route.path ? `${route.path}?view=${name}` : route ? '' : null

  let el

  $: el && emitViewBox(el)

  let canvasEl = null
  let outlineEl = null
  export { canvasEl as canvas, outlineEl as outline }
</script>

<div
  bind:this={el}
  class="svench view box"
  class:ui
  class:flex={!ui}
  class:outline
  class:centered
  class:padding>
  {#if ui}
    <h3 class="svench view">
      <a {href}><span class="icon">◇</span> {name}</a>
    </h3>
  {/if}
  <div bind:this={canvasEl} class="svench view canvas">
    <div bind:this={outlineEl} class="svench view outline">
      {#if error}
        <ViewRenderError {error} />
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
</style>
