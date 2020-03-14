<script>
  export let name
</script>

<div class="svench view box">
  <h3 class="svench view">{name}</h3>
  <div class="svench view canvas">
    <slot />
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
  .canvas {
    /* box-shadow: inset 0 2px 5px 2px rgba(128, 128, 128, 0.15),
      inset 0 1px 0 2px rgba(128, 128, 128, 0.05); */
    overflow: auto;
  }
</style>
