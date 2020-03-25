<script>
  import { writable } from 'svelte/store'
  import { route } from '@sveltech/routify'
  import { getContext, updateContext } from '../util.js'

  const { focus, routes } = getContext()

  $: index =
    !$focus && $routes.find(({ path }) => path === `${$route.path}/index`)

  $: indexLoader = index && index.component()

  const defaultRenderSrc = writable(null)

  $: $defaultRenderSrc = $route.path

  updateContext({ defaultRenderSrc })
</script>

{#if index}
  {#await indexLoader then index}
    <svelte:component this={index} />
  {/await}
{:else}
  <slot />
{/if}
