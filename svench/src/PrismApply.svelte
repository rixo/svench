<script>
  import { onMount } from 'svelte'
  import onHmr from './PrismApply.hmr.js'

  const highlight = () => {
    if (typeof Prism === 'undefined') return
    // ensure emptied .code-toolbar are removed (Svelte don't know of them, so
    // it only cleans the <pre> tag)
    document.querySelectorAll('.code-toolbar').forEach(x => {
      if (!x.querySelector('pre')) x.remove()
    })
    // eslint-disable-next-line no-undef
    Prism.highlightAll()
  }

  onMount(highlight)

  onHmr(highlight)
</script>

<slot />
