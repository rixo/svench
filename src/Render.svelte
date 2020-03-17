<script>
  import { get } from 'svelte/store'
  import { setContext, getContext } from './util'
  import { url } from '@sveltech/routify'

  export let view
  export let src = null

  let error = null

  const ctx = getContext()
  const { register, routes, options } = ctx

  const matchPath = src => {
    const _url = get(url)
    const srcPath = _url(src)
    // TODO real glob / wildcard support...
    if (srcPath.slice(-1) === '*') {
      const srcPrefix = srcPath.slice(0, -1)
      const { length: l } = srcPrefix
      return ({ path }) => path.slice(0, l) === srcPrefix
    }
    return ({ path }) => path === srcPath
  }

  const setComponents = x => {
    error = null
    components = x
  }

  const setError = err => {
    error = err
  }

  const loadSrc = src => {
    // can't use $url: we are not in Routify context during register
    const matchedRoutes = $routes.filter(matchPath(src))
    if (!matchedRoutes) {
      setError(new Error(`route not found: ${src}`))
    }
    Promise.all(
      matchedRoutes
        .filter(r => r.component)
        .map(route => Promise.resolve(route.component()))
    )
      .then(setComponents)
      .catch(setError)
  }

  const resolveSrc = src =>
    !src ? null : typeof src === 'string' ? loadSrc(src) : src

  $: components = !register && resolveSrc(src)

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
    {#if components}
      {#each components as cmp}
        <svelte:component this={cmp} />
      {/each}
    {:else}
      <h2>Not found: {src}</h2>
    {/if}
  {:else}
    <slot />
  {/if}
{/if}
