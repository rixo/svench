<script>
  import { onDestroy } from 'svelte'
  import { getContext, setContext } from './util'

  const { options } = getContext()

  export let route
  export let pages

  let _views = []

  let path
  let loader
  let component

  let timeout
  const schedule = callback => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, $options.registerTimeout)
  }

  onDestroy(() => {
    clearTimeout(timeout)
  })

  const mapRoute = ({ path, shortPath, isIndex, component, meta }) => ({
    id: path,
    isIndex,
    path,
    shortPath,
    title:
      meta && meta['svench:title'] && meta['svench:title'].replace(/_/g, ' '),
    loader: component,
  })

  const registerRoute = route => {
    component = null
    path = route.path
    loader = route.component

    $pages[path] = {
      ...mapRoute(route),
      views: [],
    }

    Promise.resolve()
      .then(loader)
      .then(cmp => {
        _views = []
        component = cmp
      })
      .catch(error => {
        $pages[path].error = error
      })
  }

  $: if (route) registerRoute(route)

  let resetNext = false

  const register = name => {
    // clear error on first register after hot update
    if (resetNext) {
      delete $pages[path].error
      resetNext = false
    }

    _views.push(name || $options.defaultViewName(_views.length + 1))

    $pages[path].views = _views

    schedule(() => {
      resetNext = true
      _views = []
    })
  }

  setContext({ register })
</script>

{#if component && !route.isIndex}
  <svelte:component this={component} />
{/if}
