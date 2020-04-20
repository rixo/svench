<script>
  '@!hmr'

  import { onMount, onDestroy } from 'svelte'
  import OffscreenContext from './OffscreenContext.svelte'
  import { getContext, updateContext } from './util.js'

  export let Component

  let offscreen
  let parent

  parent = null

  const views = []

  const emitView = async (view, callback) => {
    views.push([view, callback])
  }

  updateContext({ emitView })

  const context = getContext()

  if (Component) {
    const target = document.createDocumentFragment()
    const cmp = new OffscreenContext({
      target,
      props: {
        Component,
        context: { ...context, emitView },
      },
    })
    onDestroy(() => cmp.$destroy)
  }

  onMount(() => {
    parent = offscreen.parentNode
    const anchor = offscreen.nextSibling
    while (views.length > 0) {
      const [view, callback] = views.shift()
      parent.insertBefore(view, anchor)
      callback()
    }
  })
</script>

{#if !parent}
  <svench:offscreen bind:this={offscreen} hidden />
{/if}
