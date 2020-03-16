<script>
  import { getContext } from './util.js'

  const { options } = getContext()

  $: ({ outline, centered, padding } = $options)
  // const outline = true

  export let name
</script>

<div class="svench view box" class:outline class:centered class:padding>
  <h3 class="svench view">{name}</h3>
  <div class="svench view canvas">
    <div class="svench view outline">
      <slot />
    </div>
  </div>
</div>

<style>
  h3 {
    background: var(--secondary, #aaa);
    color: var(--secondary-r, #fff);
    padding: 0.33em 0.66em;
    margin: 0;
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
    left: -2px;
    right: -2px;
    top: -2px;
    bottom: -2px;
  }
</style>
