<script>
  import { getContext } from './util.js'
  import Shadow from './Shadow.svelte'

  // let loader
  // export { loader as ui }

  export let focus

  export let App
  export let error
  export let css
  export let shadow

  // let App, ViewBox, RenderBox
  // let error
  //
  // let css
  // let stylesheet
  // let cssString = ''
  //
  // let currentLoader
  //
  // const load = loader => {
  //   if (currentLoader === loader) return
  //   currentLoader = loader
  //   App = ViewBox = RenderBox = null
  //   Promise.resolve(loader())
  //     .then(module => {
  //       error = null
  //       ;({ App, ViewBox, RenderBox } = module)
  //       cssString = module.css
  //       if (stylesheet) {
  //         stylesheet.innerHTML = cssString
  //       }
  //       if (css) {
  //         css.replace(cssString)
  //       }
  //     })
  //     .catch(err => {
  //       error = err
  //     })
  // }
  //
  // $: load(loader)

  const { router, options, commands, tree, extras } = getContext()

  // $: ({ shadow } = $options)

  $: props = { options, commands, tree, router, focus, extras: $extras }

  // updateContext({
  //   getUi: () => ({ css, ViewBox, RenderBox }),
  // })
  //
  // const setShadow = shadow => {
  //   if (shadow) {
  //     if (stylesheet) {
  //       stylesheet.remove()
  //       stylesheet = null
  //     }
  //     if (!css) {
  //       // https://stackoverflow.com/a/42647968/1387519
  //       css = new CSSStyleSheet()
  //       css.replace(cssString)
  //     }
  //   } else {
  //     if (css) {
  //       css = null
  //     }
  //     if (!stylesheet) {
  //       stylesheet = document.createElement('style')
  //       stylesheet.innerHTML = cssString
  //       document.head.appendChild(stylesheet)
  //     }
  //   }
  // }
  //
  // $: setShadow(shadow)
</script>

{#if error}
  <pre>{error}</pre>
{:else if App}
  {#if shadow}
    <Shadow {router} Component={App} {props} {css}>
      <slot />
    </Shadow>
  {:else}
    <svelte:component this={App} {...props}>
      <slot />
    </svelte:component>
  {/if}
{/if}
