/**
 * Restore scroll and scroll to hash
 *
 * - on navigate...
 *   - if pop state (meaning history nav) => restore last scroll
 *   - if hash (direct nav in new tab session) => track anchor
 *   - else (push state) => scroll top
 */
import { pipe } from './util.js'

const getScrollOffset = () => {
  const el = document.querySelector('.svench-ui')
  if (!el) return 0
  const h = getComputedStyle(el).getPropertyValue('--toolbar-height')
  if (!h) return 0
  const match = /^(.*)em$/.exec(h)
  if (match) {
    return (
      match[1] *
      getComputedStyle(el)
        .getPropertyValue('font-size')
        .replace(/px$/, '')
    )
  }
  return h.replace(/px$/, '')
}

export default (el, getOptions) => {
  let trackStart = null
  let canceled = false

  const handleScroll = () => {
    if (Date.now() - trackStart > 200) {
      canceled = true
    }
  }

  const registerMonitor = () => {
    addEventListener('scroll', handleScroll)
    return () => removeEventListener('scroll', handleScroll)
  }

  const handlePopState = ({ state }) => {
    if (!state) return
    const { scrollTop } = state
    if (scrollTop != null) return
  }

  const registerPopState = () => {
    addEventListener('popstate', handlePopState)
    return () => removeEventListener('popstate', handlePopState)
  }

  const registerHmr = () => {
    let scrollTopBefore = null

    const before = () => {
      scrollTopBefore = el.scrollTop
    }

    const after = () => {
      requestAnimationFrame(() => {
        el.scrollTop = scrollTopBefore
      })
    }

    if (import.meta.hot && import.meta.hot.beforeUpdate) {
      import.meta.hot.beforeUpdate(before)
      import.meta.hot.afterUpdate(after)
    }

    return () => {}
  }

  const registerSession = () => {
    const onUnload = e => {
      e.preventDefault()
      const { localStorageKey } = getOptions()
      if (!localStorageKey || !window.sessionStorage) return
      const key = `${localStorageKey}.scroll`
      sessionStorage.setItem(key, el.scrollTop)
    }

    window.addEventListener('unload', onUnload)

    return () => {
      removeEventListener('unload', onUnload)
    }
  }

  const VOID = Symbol('Svench.scroll.VOID')

  const trackScroll = (
    getScroll,
    { max = 2000, stableThreshold = 333 } = {}
  ) => {
    // console.trace('trackScroll')
    const start = Date.now()
    let since = null
    let lastValue = VOID

    canceled = false
    trackStart = start

    const track = () => {
      if (canceled) return
      const { top, value = top } = getScroll() || {}
      if (top != null) {
        el.scrollTo({ top })
      }
      if (value === lastValue) {
        if (Date.now() - since > stableThreshold) {
          trackStart = null
          return
        }
      } else {
        lastValue = value
        since = Date.now()
      }
      if (Date.now() - start > max) {
        // give up
        trackStart = null
        return
      }
      requestAnimationFrame(track)
    }

    track()
  }

  const restoreSession = () => {
    const { localStorageKey } = getOptions()
    if (!localStorageKey || !window.sessionStorage) return
    const key = `${localStorageKey}.scroll`
    const restore = sessionStorage.getItem(key)
    sessionStorage.setItem(key, null)
    if (restore) {
      trackScroll(() => ({
        top: restore,
        value: el.offsetHeight,
      }))
    }
  }

  const trackAnchor = hash => {
    const name = hash.replace(/^#/, '')
    const offset = getScrollOffset() || 0
    trackScroll(() => {
      const target = document.querySelector(
        `:target, ${hash}, a[name="${name}"]`
      )
      if (!target) return
      // TODO measure extraoffset from env
      const extraOffset = 12
      const top = target.offsetTop - offset - extraOffset
      return { top }
    })
  }

  const navigate = ({ hash, popState }) => () => {
    if (popState) {
      return
    } else if (hash) {
      if (trackStart !== null) return
      trackAnchor(hash)
    } else {
      document.body.scrollTo({ top: 0 })
    }
  }

  const dispose = pipe(
    registerMonitor(),
    registerHmr(),
    registerPopState(),
    registerSession()
  )

  restoreSession()

  return { dispose, navigate }
}
