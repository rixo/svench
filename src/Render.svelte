<script>
  import { get } from 'svelte/store'
  import { updateContext, getContext, constStore } from './util.js'
  import RenderContext from './RenderContext.svelte'
  import RenderBox from './RenderBox.svelte'
  import { urlResolver } from './helpers/url.js'

  import _Render from './Render.svelte'

  const ctx = getContext()
  // route$ can come from Routify, Register, or a parent Render
  const { routes, route$, defaultRenderSrc } = ctx

  export let src = null

  let _view = false
  export { _view as view }
  export let all = false

  let view = all ? true : _view
  $: view = all ? true : _view

  $: focus = view !== true

  let error = null

  $: route = $route$

  $: _url = urlResolver($routes, $route$)

  const matchPath = src => {
    const srcPath = _url(src, {}, true)
    // TODO real glob / wildcard support...
    if (srcPath.slice(-2) === '**') {
      const srcPrefix = srcPath.slice(0, -2)
      const { length: l } = srcPrefix
      return route =>
        route.path.slice(0, l) === srcPrefix ? [srcPrefix, route] : false
    } else if (srcPath.slice(-1) === '*') {
      const srcPrefix = srcPath.slice(0, -1)
      const { length: l } = srcPrefix
      return r =>
        r.path.slice(0, l) === srcPrefix && !r.path.slice(l).includes('/')
          ? [srcPrefix, r]
          : false
    }
    return route => (route.path === srcPath ? [false, route] : false)
  }

  let components = []

  const setComponents = x => {
    error = null
    components = x
  }

  const setError = err => {
    error = err
  }

  const formatTitle = (route, prefix) =>
    prefix === false
      ? null
      : {
          title: route.path.slice(prefix.length),
          href: route.path,
        }

  const loadSrc = src => {
    const matchedRoutes = $routes.map(matchPath(src)).filter(Boolean)
    Promise.all(
      matchedRoutes
        .filter(([, route]) => route.component)
        .map(([prefix, route]) =>
          Promise.resolve(route.component()).then(Component => ({
            Component,
            route,
            ...formatTitle(route, prefix),
          }))
        )
    )
      .then(setComponents)
      .catch(setError)
  }

  const loadSrcRoute = async route => {
    try {
      const loader = route.component || route.loader
      const Component = await loader()
      setComponents([{ Component, route, ...formatTitle(route, false) }])
    } catch (err) {
      setError(err)
    }
  }

  const resolveSrc = src =>
    !src
      ? null
      : typeof src === 'string'
      ? loadSrc(src)
      : typeof src === 'function'
      ? [src].flat()
      : loadSrcRoute(src)

  $: $route$ && resolveSrc(src || (defaultRenderSrc && $defaultRenderSrc))

  updateContext({
    render: constStore(view),
    register: false,
  })
</script>

{#if error}
  <div>
    <h2>Error!</h2>
    <pre>{error.stack || error}</pre>
  </div>
{:else if components}
  {#each components as { Component, route, title, href } (Component)}
    <RenderContext {route}>
      <!-- slot for nested <Render> -->
      <slot />

      <RenderBox {route} {title} {focus}>
        <svelte:component this={Component} />
      </RenderBox>
    </RenderContext>
  {/each}
{:else}
  <h2>Not found: {src}</h2>
{/if}
