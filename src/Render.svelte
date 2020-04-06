<script>
  import { updateContext, getContext, constStore } from './util.js'
  import RenderContext from './RenderContext.svelte'
  import RenderBox from './RenderBox.svelte'
  import { urlResolver } from './helpers/url.js'
  import RenderOffscreen from './RenderOffscreen.svelte'

  import { matchPath } from './Render.util.js'

  const ctx = getContext()
  // route$ can come from Routify, Register, or a parent Render
  const { routes, route$, indexRoute, defaultRenderSrc } = ctx

  // prop: with
  //
  // <Render with="./Source">
  //   <Render view="foo" />
  //   <Render view="bar" />
  // </Render>
  //
  // NOTE we're using with because the following causes a crash in Svelte:
  //
  // <slot>
  //   <RenderBox {route} {title} {focus}>
  //     <svelte:component this={Component} />
  //   </RenderBox>
  // </slot>
  //
  let _with = null
  export { _with as with }

  export let src = _with === true ? null : _with
  export let view = true
  export let breakIsolate = false

  // NOTE we want not too much reactivity here (namely using $: expressions for
  // route and resolveUrl)
  //
  // A Render block is bound to the context (page) where it is first rendered.
  // If the route$ subsequently changes, this means this Render component is on
  // its way to be destroyed and replaced by a new page. We want to protect
  // expose ourselves against races between route$ update and page component
  // lifecycle -- so better to fix the "context" at component creation (this is
  // not a theoretical concern, a bug has already been observed when resolveUrl
  // is reactive).
  //
  const route = $route$
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
          title: route.svench.title || route.path.slice(prefix.length),
          href: route.path,
        }

  const notSelf = ([, { path }]) =>
    path !== ($indexRoute ? $indexRoute.path : route.path)

  const loadSrc = async src => {
    try {
      const matchedRoutes = $routes
        .map(matchPath(resolveUrl, src))
        .filter(Boolean)
        .filter(notSelf)
      const _components = await Promise.all(
        matchedRoutes
          .filter(([, route]) => route.component)
          .map(([prefix, route]) =>
            Promise.resolve(route.component()).then(Component => ({
              Component,
              route,
              prefix,
              ...formatTitle(route, prefix),
            }))
          )
      )
      _components.sort(({ route: a, prefix: ap }, { route: b, prefix: bp }) =>
        (a.svench.sortKey || a.path.slice(ap.length)).localeCompare(
          b.svench.sortKey || b.path.slice(bp.length)
        )
      )
      setComponents(_components)
    } catch (err) {
      setError(err)
    }
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

  $: route && resolveSrc(src || route.registerTarget || defaultRenderSrc)

  $: if (!src && !_with) {
    error = 'Missing prop: src or with'
  }

  updateContext({
    '<Render>': true,
    breakIsolate,
    render: constStore(view),
    register: false,
  })
</script>

{#if error}
  <RenderBox {error} />
{:else if components}
  {#each components as { Component, route, title, href } (Component)}
    <RenderContext {route}>
      <!-- slot for nested <Render> -->
      <slot>
        <RenderBox {title} {href}>
          <RenderOffscreen focus={breakIsolate} id="{view}-{breakIsolate}">
            <svelte:component this={Component} />
          </RenderOffscreen>
        </RenderBox>
      </slot>

      <!-- <slot />
      {#if _with == null}
        <RenderBox {title} {href}>
          <RenderOffscreen focus={breakIsolate} id="{view}-{breakIsolate}">
            <svelte:component this={Component} />
          </RenderOffscreen>
        </RenderBox>
      {/if} -->
    </RenderContext>
  {/each}
{:else}
  <h2>Not found: {src}</h2>
{/if}
