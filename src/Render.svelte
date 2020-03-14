<script>
  import { setContext } from './util'

  export let view
  export let src = null

  setContext({ render: view })

  const loadSrc = src => {
    console.trace('TODO')
  }

  const resolveSrc = src =>
    !src ? null : typeof src === 'string' ? loadSrc(src) : src

  $: cmp = resolveSrc(src)
</script>

{#if src}
  {#if cmp}
    <svelte:component this={cmp} />
  {/if}
{:else}
  <slot />
{/if}
