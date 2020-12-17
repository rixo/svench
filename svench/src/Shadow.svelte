<script context="module">
  import { detach, insert, noop } from 'svelte/internal'

  // https://github.com/sveltejs/svelte/issues/2588#issuecomment-488343541
  function createSlots(slots) {
    const svelteSlots = {}

    for (const slotName in slots) {
      svelteSlots[slotName] = [createSlotFn(slots[slotName])]
    }

    function createSlotFn(element) {
      return function() {
        return {
          c: noop,
          m: function mount(target, anchor) {
            insert(target, element, anchor)
          },
          d: function destroy(detaching) {
            if (detaching) {
              detach(element)
            }
          },
          l: noop,
        }
      }
    }
    return svelteSlots
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte'

  export let router
  export let Component
  export let props
  export let css

  export let host = null
  let cmp

  $: if (cmp) cmp.$set(props)

  const init = () => {
    const shadowRoot = host.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.innerHTML = `
      :host,
      slot {
        all: inherit;
      }
    `
    shadowRoot.appendChild(style)

    shadowRoot.adoptedStyleSheets = [css]

    router.listen(shadowRoot)

    cmp = new Component({
      target: shadowRoot,
      props: {
        ...props,
        $$slots: createSlots({ default: document.createElement('slot') }),
        $$scope: {},
      },
    })
  }

  const dispose = () => {
    if (!cmp) return
    cmp.$destroy()
    cmp = null
  }

  // onMount(() => {
  //   init()
  //   return dispose
  // })

  // onMount is called before host is bound with shadow in shadow (viewbox)
  $: if (!cmp && host) init()
  onDestroy(dispose)
</script>

<svench-shadow bind:this={host} for={Component.name}>
  <slot />
</svench-shadow>
