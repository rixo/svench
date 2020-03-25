<script>
  import { getContext } from './util.js'

  const { options, route$, emitViewBox } = getContext()

  $: ({ outline, centered, padding } = $options)

  $: route = $route$

  export let ui = true
  export let name

  $: href =
    route && route.path ? `${route.path}?view=${name}` : route ? '' : null

  let el

  $: el && emitViewBox(el)
</script>

<div
  bind:this={el}
  class="svench view box"
  class:flex={!ui}
  class:outline
  class:centered
  class:padding>
  {#if ui}
    <h3 class="svench view">
      <a {href}>{name}</a>
    </h3>
  {/if}
  <div class="svench view canvas">
    <div class="svench view outline">
      <slot />
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
    padding-left: 2rem;
    text-decoration: none;
    background: var(--secondary, #aaa);
    color: var(--secondary-r, #fff);
    opacity: 0.95;
  }
  h3 a[href]:hover {
    opacity: 1;
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
  }
</style>
