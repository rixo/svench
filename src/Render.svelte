<script>
  import { setContext, getContext } from './util'
  import { url } from '@sveltech/routify'

  export let view
  export let src = null

  let error = null

  const ctx = getContext()
  const { routes } = ctx

  setContext({ ...ctx, render: view })

  const matchPath = path => ({ path: x }) => x === path

  const setCmp = x => {
    error = null
    cmp = x
  }

  const setError = err => {
    error = err
  }

  const loadSrc = src => {
    const route = $routes.find(matchPath($url(src)))
    if (route && route.component) {
      Promise.resolve(route.component())
        .then(setCmp)
        .catch(setError)
    }
  }

  const resolveSrc = src =>
    !src ? null : typeof src === 'string' ? loadSrc(src) : src

  $: cmp = resolveSrc(src)
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
