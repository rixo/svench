<script>
  import { onDestroy } from 'svelte'
  import { setContext } from './util'

  export let route

  export let pages

  let loader = route.component
  let path = route.path
  let _views = []

  let timeout

  const schedule = callback => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, 100)
  }

  onDestroy(() => {
    clearTimeout(timeout)
  })

  $: ({ path, component: loader } = route)

  let resetNext = false

  const register = name => {
    // clear error on first register after hot update
    if (resetNext) {
      delete $pages[path].error
      resetNext = false
    }

    _views.push(name)

    $pages[path].views = _views

    schedule(() => {
      resetNext = true
      _views = []
    })
  }

  const mapRoute = ({ path, shortPath, isIndex }) => ({
    id: path,
    isIndex,
    path,
    shortPath,
  })

  $pages[path] = {
    ...mapRoute(route),
    views: [],
  }

  setContext({ register })

  let component

  Promise.resolve()
    .then(loader)
    .then(cmp => {
      _views = []
      component = cmp
    })
    .catch(error => {
      $pages[path].error = error
    })
</script>

{#if component && !route.isIndex}
  <svelte:component this={component} />
{/if}
