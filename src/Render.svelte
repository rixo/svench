<script>
  import { tick } from 'svelte'
  import { updateContext, getContext } from './util.js'
  import ComponentContext from './ComponentContext.svelte'
  import Shadow from './Shadow.svelte'
  import { canonicalResolver } from './helpers/url.js'

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

  // render in "page mode" (with padding & al)
  export let page = false

  const resolveUrl = canonicalResolver(route)

  let error = null

  let components = []
  const progressive = true
  let epoch = 0

  const resolveComponent = ([prefix, route]) =>
    Promise.resolve(route.import()).then(({ default: Component }) => ({
      Component,
      route,
      prefix,
      ...formatTitle(route, prefix),
    }))

  const setComponentsAsync = async specs => {
    if (progressive) {
      const myEpoch = ++epoch
      const remaining = [...specs]
      const push = async () => {
        if (epoch !== myEpoch) return
        components.push(await resolveComponent(remaining.shift()))
        components = components
        await tick()
        if (epoch !== myEpoch) return
        if (remaining.length > 0) requestAnimationFrame(push)
      }
      components = []
      await push()
    } else {
      components = await Promise.all(specs.map(resolveComponent))
    }
  }

  const setComponents = specs => {
    error = null
    setComponentsAsync(specs).catch(setError)
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
      matchedRoutes.sort(([ap, a], [bp, b]) =>
        (a.sortKey || a.path.slice(ap.length)).localeCompare(
          b.sortKey || b.path.slice(bp.length)
        )
      )
      setComponents(matchedRoutes)
    } catch (err) {
      setError(err)
    }
  }

  const loadSrcRoute = async route => {
    try {
      if (!route.import) return
      setComponents([false, route])
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

  $: props = { view, page, focus: false }

  // for now, we only have single views
  $: isSingleView = !!view

  $: noBox = naked || isSingleView
</script>

{#if error}
  {#if shadow}
    <Shadow {css} {router} Component={RenderBox} props={{ error }} />
  {:else}
    <RenderBox {error} />
  {/if}
{:else if components}
  <!-- slot for nested <Render> -->
  <slot>
    {#each components as { Component, route, title, href } (Component)}
      {#if noBox}
        <ComponentContext {...props} {route} component={Component} />
      {:else if shadow}
        <Shadow {css} {router} Component={RenderBox} props={{ title, href }}>
          <ComponentContext {...props} {route} component={Component} />
        </Shadow>
      {:else}
        <RenderBox {title} {href}>
          <ComponentContext {...props} {route} component={Component} />
        </RenderBox>
      {/if}
    {/each}
  </slot>
{:else}
  <h2>Not found: {src}</h2>
{/if}
