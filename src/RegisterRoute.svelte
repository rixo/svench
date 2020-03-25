<script>
  import { onDestroy } from 'svelte'
  import { setContext, noop, constStore, false$ } from './util.js'

  export let loader
  export let options
  export let route
  export let routes

  export let callback

  let views = []

  let component

  let timeout
  const schedule = callback => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, $options.registerTimeout)
  }

  onDestroy(() => {
    clearTimeout(timeout)
  })

  const loadComponent = loader => {
    component = null
    Promise.resolve()
      .then(loader)
      .then(cmp => {
        views = []
        component = cmp
      })
      .catch(error => {
        callback(error)
      })
  }

  $: if (loader) loadComponent(loader)

  export const register = name => {
    views.push(name || $options.defaultViewName(views.length + 1))

    callback(null, views)

    schedule(() => {
      views = []
    })
  }

  // --- getRenderName ---
  const getRenderName = (() => {
    let index = 0

    let timeout
    const reset = () => {
      index = 0
    }

    return name => {
      clearTimeout(timeout)
      timeout = setTimeout(reset, $options.renderTimeout)
      index++
      return name == null ? $options.defaultViewName(index) : name
    }
  })()

  setContext({
    options,
    routes,
    route$: constStore(route),
    register,
    render: false$,
    getRenderName,
  })
</script>

{#if component}
  <svelte:component this={component} />
{/if}
