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

  const getRenderName = _name => {
    const { renderTimeout, defaultViewName } = getOptions()
    clearTimeout(timeout)
    timeout = setTimeout(reset, renderTimeout)
    index++
    let name = _name == null ? defaultViewName(index) : _name
    if (taken[name]) {
      name = name + '.' + taken[name]
    }
    taken[name] = (taken[name] || 0) + 1
    return name
  }

  return getRenderName
}
