<script>
  import { updateContext, getContext } from './util.js'
  import ComponentContext from './ComponentContext.svelte'
  import { urlResolver } from './helpers/url.js'

  import { matchPath } from './Render.util.js'

  const {
    naked,
    register,
    route,
    routes,
    defaultRenderSrc,
    RenderBox,
  } = getContext()

  export let src = null
  export let view = null

  const resolveUrl = urlResolver(route)

  let error = null

  let components = []

  const setComponents = x => {
    error = null
    components = x
  }

  const setError = err => {
    // eslint-disable-next-line no-console
    console.error(err)
    error = err
  }

  const formatTitle = (route, prefix) =>
    prefix === false
      ? null
      : {
          title: route.title || route.path.slice(prefix.length),
          href: route.path,
        }

  const notSelf = ([, { path }]) => path !== route.path

  const loadSrc = async src => {
    try {
      const matchedRoutes = $routes
        .map(matchPath(resolveUrl, src))
        .filter(Boolean)
        .filter(notSelf)
      const _components = await Promise.all(
        matchedRoutes
          .filter(([, route]) => route.import)
          .map(([prefix, route]) =>
            Promise.resolve(route.import()).then(({ default: Component }) => ({
              Component,
              route,
              prefix,
              ...formatTitle(route, prefix),
            }))
          )
      )
      _components.sort(({ route: a, prefix: ap }, { route: b, prefix: bp }) =>
        (a.sortKey || a.path.slice(ap.length)).localeCompare(
          b.sortKey || b.path.slice(bp.length)
        )
      )
      setComponents(_components)
    } catch (err) {
      setError(err)
    }
  }

  const loadSrcRoute = async route => {
    try {
      const { default: Component } = await route.import()
      setComponents([{ Component, route, ...formatTitle(route, false) }])
    } catch (err) {
      setError(err)
    }
  }

  const loadSrcComponent = async cmp => {
    const targetId = cmp.$$svench_id
    const route = $routes.find(x => x.id === targetId)
    return loadSrcRoute(route)
  }

  const loadSrcObject = async obj => {
    obj = await obj
    if (obj.default) return loadSrcComponent(obj.default)
    if (obj.$$svench_id) return loadSrcComponent(obj)
    return loadSrcRoute(obj)
  }

  const resolveSrc = src =>
    !src
      ? null
      : typeof src === 'string'
      ? loadSrc(src)
      : typeof src === 'function' && !src.$$svench_id
      ? [src].flat()
      : loadSrcObject(src)

  $: !register && route && resolveSrc(src || defaultRenderSrc || route.indexOf)

  $: if (!src) {
    error = 'Missing src'
  }

  updateContext({
    register: false,
    defaultRenderSrc: src,
  })
</script>

{#if error}
  <RenderBox {error} />
{:else if components}
  {#each components as { Component, route, title, href } (Component)}
    <!-- slot for nested <Render> -->
    <slot>
      {#if naked}
        <ComponentContext {route} component={Component} {view} focus={false} />
      {:else}
        <RenderBox {title} {href}>
          <ComponentContext
            {route}
            component={Component}
            {view}
            focus={false} />
        </RenderBox>
      {/if}
    </slot>
  {/each}
{:else}
  <h2>Not found: {src}</h2>
{/if}
