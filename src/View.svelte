<script>
  /**
   * NOTE We want to render a view with some (minimal) default UI so that a
   *      .svench file can rendered as is. That is, without some context wrapper
   *      to pass options down to views.
   */
  import { getContext } from './util.js'
  import ViewBox from './ViewBox.svelte'
  import ViewData from './ViewData.svelte'
  import Render from './Render'

  export let jailbreak = null
  let _isolate = null
  export { _isolate as isolate }

  export let name = null
  export let init = null
  export let hide = false

  const {
    register,
    registerOnly,
    render,
    focus,
    getRenderName,
    meta: ctxMeta,
    route$,
    breakIsolate,
  } = getContext() || {}

  $: ui = !$focus

  const actualName = getRenderName(name)

  if (register) {
    register(actualName)
  }

  const extractMeta = props =>
    Object.fromEntries(
      Object.entries(props)
        .filter(([name]) => name.startsWith('meta:'))
        .map(([name, value]) => [name.slice(5), value])
    )

  const extractContextMeta = opts =>
    opts &&
    Object.fromEntries(
      Object.entries(opts)
        .filter(([name]) => name.startsWith('svench:'))
        .map(([name, value]) => [name.slice(7), value])
    )

  $: meta = {
    ...extractContextMeta($ctxMeta),
    ...$$props.meta,
    ...extractMeta($$props),
  }

  $: isolate =
    // isolate defaults to true, except if jailbreak is true; _isolate has higher
    // priority than jailbreak
    // _isolate prop can be used to override the default somehow
    (_isolate || !jailbreak) &&
    // we needn't isolate the view in focus because, by definition, it's solo
    !$focus &&
    // breakIsolate comes from <Render> -- means we're the inner, isolated view
    !breakIsolate

  let willRender
  $: willRender =
    !registerOnly &&
    !isolate &&
    (($render === true && !hide) || ($render && actualName === $render))

  let data = {}
  let error = null
  let resolved = false

  const prepare = () => {
    // if (onRender) data = await onRender(data)
    if (init) {
      Promise.resolve()
        .then(init)
        .then(_data => {
          data = _data
          resolved = true
        })
        .catch(err => {
          error = err
        })
    } else {
      resolved = true
    }
  }

  $: if (willRender) prepare()

  let canvas, outline
  $: if (canvas && outline) {
    // console.log('go', canvas, outline)
  }

  const isStore = x => x && typeof x.subscribe === 'function'
</script>

{#if willRender}
  <ViewBox {error} {ui} name={actualName} bind:canvas bind:outline>
    {#if !error && resolved}
      <ViewData
        store={(isStore(data) && data) || null}
        {data}
        let:data
        let:proxy>
        <slot id={actualName} {data} {proxy} />
      </ViewData>
      <!-- {#if data && typeof data.subscribe === 'function'}
        <Subscribe store={data} let:data let:proxy>
          <slot {data} {proxy} />
        </Subscribe>
      {:else}
        <slot {data} />
      {/if} -->
      <!-- <pre>{JSON.stringify(meta, false, 2)}</pre> -->
    {/if}
  </ViewBox>
{:else if isolate && !($render === true && hide)}
  <Render src={$route$} view={actualName} />
{/if}
