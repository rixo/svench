<script>
  /**
   * NOTE We want to render a view with some (minimal) default UI so that a
   *      .svench file can rendered as is. That is, without some context wrapper
   *      to pass options down to views.
   */
  import { getContext } from './util.js'
  import ViewBox from './ViewBox.svelte'

  export let name

  const { register, render = !register, getRenderName, ui = true } =
    getContext() || {}

  if (register) {
    register(name)
  }

  const actualName = render && getRenderName(name)
</script>

{#if render === true || (render && actualName === render)}
  {#if ui}
    <ViewBox name={actualName}>
      <slot />
    </ViewBox>
  {:else}
    <slot />
  {/if}
{/if}
