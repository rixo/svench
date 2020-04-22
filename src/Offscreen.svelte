<script>
  '@!hmr'

  import { onMount, onDestroy } from 'svelte'
  import OffscreenContext from './OffscreenContext.svelte'
  import { getContext, updateContext } from './util.js'

  export let Component

  let offscreen
  let parent = null
  let anchor = null

  const views = []

  const emitView = async (view, callback) => {
    if (parent) {
      parent.insertBefore(view, anchor)
      callback()
    } else {
      views.push([view, callback])
    }
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
    onDestroy(cmp.$destroy)
  }

  onMount(() => {
    parent = offscreen.parentNode
    anchor = offscreen.nextSibling
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
