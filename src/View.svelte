<script>
  /**
   * NOTE We want to render a view with some (minimal) default UI so that a
   *      .svench file can rendered as is. That is, without some context wrapper
   *      to pass options down to views.
   */
  import { getContext } from './util.js'
  import ViewBox from './ViewBox.svelte'

  export let name

  const {
    register,
    render = !register,
    ui = true,
  } = getContext() || {}

  if (register) {
    register(name)
  }
</script>

{#if render === true || name === render}
  {#if ui}
    <ViewBox {name}>
      <slot />
    </ViewBox>
  {:else}
    <slot />
  {/if}
{/if}
