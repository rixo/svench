<script>
  export let error
  export let options

  export let focus

  export let fill

  $: ({
    outline,
    centered,
    padding,
    backgroundAliases,
    canvasBackground,
    background,
  } = options)

  const viewBackgroundAliases = {
    '@none': 'transparent',
  }

  $: canvasBg = backgroundAliases[canvasBackground] || canvasBackground
  $: viewBg =
    viewBackgroundAliases[background] ||
    backgroundAliases[background] ||
    background
</script>

<svench-view-canvas
  style="background: {canvasBg}"
  class:focus
  class:svench-outline={outline}
  class:svench-center={centered}
  class:svench-fill={fill}
  class:svench-wrap={!fill}
  class:svench-padding={padding}>
  {#if error}
    <pre>{error}</pre>
  {:else}
    <div class="view svench-outline-outer">
      <div class="svench-outline" style="background: {viewBg}">
        <slot />
      </div>
    </div>
  {/if}
</svench-view-canvas>

<style>
  svench-view-canvas.focus {
    flex: 1;
  }

  svench-view-canvas.svench-padding {
    padding: 1em;
  }

  svench-view-canvas.svench-fill .svench-outline-outer {
    /* overflow: hidden; */
    display: inline-block;
    width: 100%;
    /* flex-direction: column;
    align-items: stretch;
    justify-content: center; */
  }
  svench-view-canvas.svench-wrap .svench-outline-outer {
    display: inline-block;
  }

  svench-view-canvas.svench-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  svench-view-canvas.svench-center.svench-wrap {
    align-items: center;
  }
  svench-view-canvas.svench-center.svench-fill {
    align-items: stretch;
  }

  svench-view-canvas.svench-outline .svench-outline-outer {
    /* background-color: rgba(255, 0, 255, 0.2); */
    background-color: rgba(0, 0, 255, 0.2);
    /* pointer-events: none; */
  }
  svench-view-canvas.svench-outline .svench-outline {
    position: relative;
  }
  svench-view-canvas.svench-outline .svench-outline:before {
    content: ' ';
    display: block;
    border: 2px solid magenta;
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
