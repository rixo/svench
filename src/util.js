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
