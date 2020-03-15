<script>
  import RegisterRoutes from './RegisterRoutes.svelte'
  import { setContext } from './util.js'
  import { createStores } from './stores.js'
  import { augmentRoutes } from './routify/index.js'

  import { Router } from '@sveltech/routify'

  let inputRoutes
  export { inputRoutes as routes }

  export let fixed = true

  const { options, pages, tree, routes } = createStores()

  $: $options = { fixed }

  $: augmented = augmentRoutes($inputRoutes)

  $: routes.set(augmented)

  setContext({ options, render: false, routes, tree })
</script>

<RegisterRoutes routes={$routes} {pages} />

<Router routes={$routes} />
