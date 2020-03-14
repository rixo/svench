import { getContext as getSvelteContext, setContext as setSvelteContext } from 'svelte'

const key = {}

export const getContext = () => getSvelteContext(key)

export const setContext = value => setSvelteContext(key, value)

export const pipe = (...fns) => x => fns.reduce((f, g) => g(f), x)
