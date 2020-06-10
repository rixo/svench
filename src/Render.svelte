<script>
  import { updateContext, getContext } from './util.js'
  import ComponentContext from './ComponentContext.svelte'
  import Shadow from './Shadow.svelte'
  import { urlResolver } from './helpers/url.js'

  import { matchPath } from './Render.util.js'

  const {
    router,
    getUi,
    naked,
    register,
    route,
    routes,
    defaultRenderSrc,
    options,
    renderNesting = [],
  } = getContext()

  const { renderLoopProtection } = $options

  const { RenderBox, shadow, css } = getUi ? getUi() : {}

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

  const getTitle = route =>
    route.indexOf ? getTitle(route.indexOf) : route.title

  const getPath = route => (route.indexOf ? getPath(route.indexOf) : route.path)

  const formatTitle = (route, prefix) => {
    if (prefix === false) return null
    const path = getPath(route)
    return {
      title: getTitle(route) || path.slice(prefix.length),
      // href: route.path,
      href: path,
    }
  }

  const notSelf = ([, { path }]) => path !== route.path

  const hasImport = ([, route]) => route.import

  const preferIndex = ([srcPrefix, route]) => [srcPrefix, route.index || route]

  const dedupe = () => {
    const set = new Set()
    return ([, route]) => {
      if (set.has(route)) return false
      set.add(route)
      return true
    }
  }

  const loadSrc = async src => {
    try {
      const matchedRoutes = $routes
        .map(matchPath(resolveUrl, src))
        .filter(Boolean)
        .map(preferIndex)
        .filter(dedupe())
        .filter(notSelf)
        .filter(hasImport)
      const _components = await Promise.all(
        matchedRoutes.map(([prefix, route]) =>
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

  const load = src => {
    if (!src) {
      error = 'Missing src'
      return
    }
    error = null
    if (typeof src === 'string') {
      loadSrc(src)
    } else {
      loadSrcObject(src)
    }
  }

  const loopProtectionError =
    renderLoopProtection && renderNesting.length > renderLoopProtection

  if (loopProtectionError) {
    error = new Error(`Maximum render loop: ${renderNesting.join(' -> ')}`)
    // throw it or the stack will explode
    throw error
  }

  // route can be resolved async
  $: if (!loopProtectionError && !register && route) {
    load(src || defaultRenderSrc || route.indexOf)
  }

  updateContext({
    renderNesting: [...renderNesting, `${route && route.path} (${src})`],
    register: false,
    // WARNING private slot API
    defaultRenderSrc: $$props.$$slots && $$props.$$slots.default && src,
  })
</script>

{#if error}
  {#if shadow}
    <Shadow {css} {router} Component={RenderBox} props={{ error }} />
  {:else}
    <RenderBox {error} />
  {/if}
{:else if components}
  {#each components as { Component, route, title, href } (Component)}
    <!-- slot for nested <Render> -->
    <slot>
      {#if naked}
        <ComponentContext {route} component={Component} {view} focus={false} />
      {:else if shadow}
        <Shadow {css} {router} Component={RenderBox} props={{ title, href }}>
          <ComponentContext
            {route}
            component={Component}
            {view}
            focus={false} />
        </Shadow>
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
