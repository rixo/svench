<script>
  /**
   * NOTE We want to render a view with some (minimal) default UI so that a
   *      .svench file can rendered as is. That is, without some context wrapper
   *      to pass options down to views.
   */
  import { getContext } from './util'
  import ViewBox from './ViewBox.svelte'
  import { VIEW_INIT } from './constants'
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
    [VIEW_INIT]: mainInit,
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

  let shouldRender
  $: shouldRender =
    !registerOnly &&
    (($render === true && !hide) || ($render && actualName === $render))

  $: willRender = shouldRender && !isolate

  let error = null
  let resolved = false

  const prepare = async () => {
    try {
      if (mainInit) await mainInit()
      if (init) await init()
      resolved = true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      error = err
    }
  }

  $: if (willRender) prepare()

  let canvas, outline
  $: if (canvas && outline) {
    // console.log('go', canvas, outline)
  }
</script>

{#if shouldRender}
  {#if isolate}
    <Render src={$route$} view={actualName} breakIsolate />
  {:else}
    <ViewBox {error} {ui} name={actualName} bind:canvas bind:outline>
      {#if !error && resolved}
        <slot id={actualName} />
        <!-- <pre>{JSON.stringify(meta, false, 2)}</pre> -->
      {/if}
    </ViewBox>
  {/if}
{/if}
