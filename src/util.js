import {
  getContext as getSvelteContext,
  setContext as setSvelteContext,
} from 'svelte'

const key = { context: 'Svench' }

export const getContext = () => getSvelteContext(key)

export const setContext = value => setSvelteContext(key, value)

export const updateContext = transform =>
  setContext(
    typeof transform === 'function'
      ? transform(getContext())
      : { ...getContext(), ...transform }
  )

export const pipe = (...fns) => x => fns.reduce((f, g) => g(f), x)

export const noop = () => {}

export const get = steps => route =>
  steps.split('.').reduce((cur, step) => cur && cur[step], route)

export const false$ = {
  subscribe: listener => {
    listener(false)
    return noop
  },
}

export const constStore = value => ({
  subscribe: listener => {
    listener(value)
    return noop
  },
})

export const makeNamer = getOptions => {
  let index
  let taken
  let timeout

  const reset = () => {
    index = 0
    taken = {}
  }

  reset()

  const getRenderName = (_name, onDestroy) => {
    const { renderTimeout, defaultViewName } = getOptions()

    clearTimeout(timeout)
    timeout = setTimeout(reset, renderTimeout)

    index++

    const wantedName = _name == null ? defaultViewName(index) : _name

    let name = wantedName
    if (taken[name]) {
      name = `${name} (${taken[wantedName]})`
    }

    taken[wantedName] = (taken[wantedName] || 0) + 1

    // we need to handle leaving View components for HMR (otherwise components
    // rerendered by HMR messes the actual index and new views end up not being
    // rendered because they are given unsync indexes)
    onDestroy(() => {
      taken[wantedName]--
    })
    return name
  }

  return getRenderName
}
