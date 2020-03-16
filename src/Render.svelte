<script>
  import { get } from 'svelte/store'
  import { setContext, getContext } from './util'
  import { url } from '@sveltech/routify'

  export let view
  export let src = null

  let error = null

  const ctx = getContext()
  const { register, routes, options } = ctx

  const matchPath = path => ({ path: x }) => x === path

  const setCmp = x => {
    error = null
    cmp = x
  }

  const setError = err => {
    error = err
  }

  const loadSrc = src => {
    // can't use $url: we are not in Routify context during register
    const route = $routes.find(matchPath(get(url)(src)))
    if (!route) {
      setError(new Error(`route not found: ${src}`))
    }
    if (route && route.component) {
      Promise.resolve(route.component())
        .then(setCmp)
        .catch(setError)
    }
  }

  const resolveSrc = src =>
    !src ? null : typeof src === 'string' ? loadSrc(src) : src

  $: cmp = !register && resolveSrc(src)

  let index = 0

  let timeout
  const reset = () => {
    index = 0
  }

  const getRenderName = name => {
    clearTimeout(timeout)
    timeout = setTimeout(reset, $options.renderTimeout)
    return name == null ? $options.defaultViewName(++index) : name
  }

  setContext({ ...ctx, render: view, getRenderName })
</script>

{#if error}
  <div>
    <h2>Error!</h2>
    <pre>{error.stack || error}</pre>
  </div>
{:else}
  {#if src}
    {#if cmp}
      <svelte:component this={cmp} />
    {:else}
      <h2>Not found: {src}</h2>
    {/if}
  {:else}
    <slot />
  {/if}
{/if}
