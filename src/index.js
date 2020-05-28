// we need to do this before anything imports navaid... hope this is not
// already too late!
history._replaceState = history.replaceState

export { default as View } from './View.js'
export { default as Render } from './Render.js'
export { default as Register } from './Register.svelte'
export { default as Index } from './Index.svelte'

export { default as Svench } from './Svench.svelte'

// helpers
export { default as onRender } from './helpers/onRender.js'
export { url } from './helpers/url.js'
