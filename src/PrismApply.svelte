<script>
  import { onMount } from 'svelte'
  import onHmr from './PrismApply.hmr.js'

  const highlight = () => {
    if (typeof Prism === 'undefined') return
    // eslint-disable-next-line no-undef
    Prism.highlightAll()
  }

  onMount(highlight)

  onHmr(highlight)
</script>

<slot />
