/**
 * Ensure Prism is always correctly reapplied after a HMR update.
 */

if (typeof window !== 'undefined' && window.__SVELTE_HMR) {
  window.__SVELTE_HMR.on('afterupdate', () => {
    if (typeof Prism === 'undefined') return
    // ensure emptied .code-toolbar are removed (Svelte don't know of them, so
    // it only cleans the <pre> tag)
    document.querySelectorAll('.code-toolbar').forEach(x => {
      if (!x.querySelector('pre')) x.remove()
    })
    // eslint-disable-next-line no-undef
    Prism.highlightAll()
  })
}
