<script>
  /**
   * NOTE We want to render a view with some (minimal) default UI so that a
   *      .svench file can rendered as is. That is, without some context wrapper
   *      to pass options down to views.
   */
  import { getContext } from './util.js'
  import ViewRenderError from './ViewRenderError.svelte'
  import ViewBox from './ViewBox.svelte'

  export let name = null
  export let init = null
  export let hide = false

  const { register, render, focus, getRenderName } = getContext() || {}

  $: ui = !$focus

  const actualName = getRenderName(name)

  if (register) {
    register(actualName)
  }

  $: willRender =
    ($render === true && !hide) || ($render && actualName === $render)

  // const resolveData = async () => {
  //   let data = {}
  //   if (willRender) {
  //     // if (onRender) data = await onRender(data)
  //     if (init) {
  //       // const set = data =>
  //       data = await init(set, data)
  //       debugger
  //     }
  //   }
  //   return data
  // }
  //
  // // let data = {}
  // const dataPromise = resolveData()

  let data = {}
  let error = null
  let resolved = false

  const extractMeta = props =>
    Object.fromEntries(
      Object.entries(props)
        .filter(([name]) => name.slice(0, 5) === 'meta:')
        .map(([name, value]) => [name.slice(5), value])
    )

  $: meta = { ...$$props.meta, ...extractMeta($$props) }

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
</script>

{#if willRender}
  <ViewBox {ui} name={actualName}>
    {#if error}
      <ViewRenderError {error} />
    {:else if resolved}
      <slot {data} />
      <!-- <pre>{JSON.stringify(meta, false, 2)}</pre> -->
    {/if}
  </ViewBox>
{/if}
