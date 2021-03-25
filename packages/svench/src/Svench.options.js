import { writable, derived } from 'svelte/store'
import { noop, pipe } from './util.js'

const stateOptions = {
  fs: 'fullscreen',
  c: 'centered',
  o: 'outline',
  p: 'padding',
  f: 'focus',
  x: 'raw',
  xx: 'naked',
  cv: 'canvasBackground',
  bg: 'background',
  shadow: 'shadow',
  dev: 'dev',
}

const hiddenOptionValues = {
  shadow: false,
  dev: false,
}

const localOptions = ['menuWidth', 'menuVisible', 'extrasHeight']

const readParamsOptions = () => {
  const q = new URLSearchParams(window.location.search)
  const opts = {}
  Object.entries(stateOptions).forEach(([key, name]) => {
    if (!q.has(key)) return
    const v = q.get(key)
    if (v === 'false') {
      opts[name] = false
      return
    }
    opts[name] =
      v === 'true' || v === '' ? true : /^\d+$/.test(v) ? parseInt(v) : v
  })
  return opts
}

const parseOptions = ({
  localStorageKey = 'Svench',

  enabled,

  fixed = true,

  defaultViewName = index => `View ${index}`,

  // time before which view index is reset (for HMR)
  registerTimeout = 100,
  renderTimeout = 100,

  // dev mode
  dev = false,

  // hmr
  hmrScrollStickBottom = true,

  // state
  menuWidth = 220,
  menuVisible = true,
  extrasHeight = 200,

  // ui
  shadow = false,
  centered = true,
  outline = false,
  padding = true,
  fullscreen = false,

  background = '#fff', // view "outline" background
  canvasBackground = '@none',
  backgroundAliases = {
    '@none':
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dOxDQBACAJA/b1Y54dyHRZzBQoLY6Am1xCS5A8hAErpvRiOQYMbwFSL6qM8isGTYAOhNQbW5Q4iGwAAAABJRU5ErkJggg==)',
  },
  backgrounds = [
    { value: '#fff' },
    { value: '#000' },
    { value: '#f00' },
    { value: '#0f0' },
    { value: '#00f' },
    { value: '#ff0' },
    { value: '#f0f' },
    { value: '#0ff' },
    ...Array.from({ length: 21 })
      .map((_, i) => ({
        label: `${i * 5}%`,
        value: `hsl(0, 0%, ${i * 5}%)`,
      }))
      .reverse(),
  ],
  canvasBackgrounds = backgrounds,

  // advanced

  // maximum number of nesting levels of <Render> before throwing an error
  renderLoopProtection = 6,
}) => ({
  localStorageKey,
  enabled,
  fixed,
  defaultViewName,
  // time before which view index is reset (for HMR)
  registerTimeout,
  renderTimeout,
  hmrScrollStickBottom,
  menuWidth,
  menuVisible,
  extrasHeight,
  // dev mode
  dev,
  // ui
  shadow,
  centered,
  outline,
  padding,
  fullscreen,
  canvasBackground,
  background,
  backgroundAliases,
  backgrounds,
  canvasBackgrounds,
  // advanced
  renderLoopProtection,
})

const stateful = initialOptions => {
  const { localStorageKey } = initialOptions

  const readStoredOptions =
    localStorageKey && window.localStorage
      ? () => {
          const stored = localStorage.getItem(localStorageKey)
          return (stored && JSON.parse(stored)) || {}
        }
      : noop

  // --- local state (query params) ---

  const updateState = opts => {
    if (localStorageKey && window.localStorage) {
      const values = Object.fromEntries(
        localOptions.map(name => [name, opts[name]])
      )
      localStorage.setItem(localStorageKey, JSON.stringify(values))
    }

    // NOTE using history._replaceState to avoid useless looping with Routify
    // _replaceState is the original replaceState before Routify hacks it
    if (window.history && history._replaceState) {
      const q = new URLSearchParams(window.location.search)
      Object.entries(stateOptions).forEach(([key, name]) => {
        const value = opts[name]
        if (value == null || hiddenOptionValues[name] == opts[name]) {
          q.delete(key)
        } else if (value === false) {
          q.set(key, 0)
        } else {
          q.set(key, value)
        }
      })
      let url = location.pathname
      const qs = q.toString()
      if (qs.length > 0) {
        url += '?' + qs.replace(/=true(?=&|$)/g, '')
      }
      const currentUrl = location.pathname + location.search
      if (url !== currentUrl) {
        // NOTE we need to keep the state, because it contains restore scroll
        // position
        history._replaceState(history.state, '', url)
      }
    }
  }

  const store = writable({
    ...initialOptions,
    ...readStoredOptions(),
    ...readParamsOptions(),
  })

  const persisting = derived(store, x => {
    updateState(x)
    return x
  })

  persisting.set = (...args) => store.set(...args)

  return persisting
}

export default pipe(parseOptions, stateful)
