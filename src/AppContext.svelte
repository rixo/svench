<script>
  import { getContext } from './util.js'

  let loader
  export { loader as App }
  export let focus

  let App
  let error

  Promise.resolve(loader)
    .then(({ default: Cmp }) => {
      error = null
      App = Cmp
    })
    .catch(err => {
      error = err
    })

  const { router, options, tree, extras } = getContext()
</script>

{#if error}
  <pre>{error}</pre>
{:else}
  <svelte:component
    this={App}
    {options}
    {tree}
    {router}
    {focus}
    extras={$extras}>
    <slot />
  </svelte:component>
{/if}
