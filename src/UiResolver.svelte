<script>
  import { updateContext } from './util.js'

  export let shadow
  export let ui
  export let shadowUi
  export let lightUi

  $: loader = (shadow ? shadowUi : lightUi) || ui

  let css
  let stylesheet
  let cssString = ''

  let App, ViewBox, RenderBox
  let error

  export let current

  const update = () => {
    current = { shadow, css, error, App, ViewBox, RenderBox }
  }

  update()

  const getUi = () => current

  let currentLoader

  const load = loader => {
    if (currentLoader === loader) return
    currentLoader = loader
    App = ViewBox = RenderBox = null
    update()
    Promise.resolve(loader())
      .then(module => {
        error = null
        ;({ App, ViewBox, RenderBox } = module)
        cssString = module.css
        if (stylesheet) {
          stylesheet.innerHTML = cssString
        }
        if (css) {
          css.replace(cssString)
        }
        update()
      })
      .catch(err => {
        error = err
        update()
      })
  }

  $: load(loader)

  const setShadow = shadow => {
    if (shadow) {
      if (stylesheet) {
        stylesheet.remove()
        stylesheet = null
      }
      if (!css) {
        // https://stackoverflow.com/a/42647968/1387519
        css = new CSSStyleSheet()
        css.replace(cssString)
      }
    } else {
      if (css) {
        css = null
      }
      if (!stylesheet && cssString) {
        stylesheet = document.createElement('style')
        stylesheet.innerHTML = cssString
        document.head.appendChild(stylesheet)
      }
      if (stylesheet && cssString) {
        stylesheet.remove()
        stylesheet = null
      }
    }
    update()
  }

  $: setShadow(shadow)

  updateContext({ getUi })
</script>

<!-- <svelte:head>
  {#if shadow}
    {@html `${'<'}style>${cssString}</style>`}
  {/if}
</svelte:head> -->

<!-- <slot {App} {error} {css} {shadow} /> -->
<slot {current} />
