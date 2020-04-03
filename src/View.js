import { VIEW_INIT } from './constants.js'
import { updateContext } from './util.js'
import View from './View.svelte'

Object.defineProperty(View, 'init', {
  set(value) {
    updateContext({
      [VIEW_INIT]: value,
    })
  },
})

export default View
