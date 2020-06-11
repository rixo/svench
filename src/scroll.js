/**
 * Restore scroll and scroll to hash
 *
 * - on page load...
 *   - if stored session => restore stored scroll
 *   - if hash => track anchor
 *   - else => nothing (browser's default)
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

export default getOptions => {
  let el

  let trackStart = null
  let canceled = false

  const getCurrent = () => el && { top: el.scrollTop, left: el.scrollLeft }

  const registerCancelOnUserScroll = () => {
    const handleScroll = () => {
      if (Date.now() - trackStart > 200) {
        canceled = true
      }
    }

    el.addEventListener('scroll', handleScroll)

    return () => el.removeEventListener('scroll', handleScroll)
  }

  const registerTrackScrollState = () => {
    let scrollTimeout

    const saveScroll = () => {
      const scroll = getCurrent()
      history._replaceState({ ...history.state, scroll }, '')
    }

    const handleScroll = () => {
      if (Date.now() - trackStart > 200) {
        canceled = true
      }
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(saveScroll, 50)
    }

    el.addEventListener('scroll', handleScroll)

    return () => el.removeEventListener('scroll', handleScroll)
  }

  const registerHmr = () => {
    let restore = null

    const before = () => {
      if (!el) return
      restore = getCurrent()
    }

    const after = () => {
      if (!el) return
      trackScroll(restore)
    }

    if (import.meta.hot && import.meta.hot.beforeUpdate) {
      import.meta.hot.beforeUpdate(before)
      import.meta.hot.afterUpdate(after)
    }

    return () => {}
  }

  const registerSessionUnload = () => {
    const onUnload = e => {
      e.preventDefault()
      const { localStorageKey } = getOptions()
      if (!localStorageKey || !window.sessionStorage) return
      const key = `${localStorageKey}.scroll`
      sessionStorage.setItem(key, JSON.stringify(getCurrent()))
    }

    window.addEventListener('unload', onUnload)

    return () => {
      removeEventListener('unload', onUnload)
    }
  }

  const VOID = Symbol('Svench.scroll.VOID')

  const trackScroll = (
    getScroll,
    { max = 2000, stableThreshold = 500 } = {}
  ) => {
    if (!getScroll) return

    const start = Date.now()
    let since = null
    let lastValue = VOID

    canceled = false
    trackStart = start

    const track = () => {
      if (canceled) return
      const { top, left, value = `${el.scrollTop}:${el.scrollLeft}` } =
        (typeof getScroll === 'function' ? getScroll() : getScroll) || {}
      if (top != null) {
        el.scrollTo({ top, left })
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
    if (!el) return
    if (popState) {
      trackScroll(popState.scroll)
    } else if (hash) {
      // priority to session restore
      if (trackStart !== null) return
      trackAnchor(hash)
    } else {
      el.scrollTo({ top: 0 })
    }
  }

  const restoreSession = () => {
    const { localStorageKey } = getOptions()
    if (!localStorageKey || !window.sessionStorage) return
    const key = `${localStorageKey}.scroll`
    const restore = sessionStorage.getItem(key)
    sessionStorage.setItem(key, null)
    if (restore) {
      trackScroll(JSON.parse(restore))
    }
  }

  let unregisterTargeted
  let initial = true

  const setTarget = target => {
    el = target

    if (initial) {
      initial = false
      restoreSession()
    } else {
      unregisterTargeted()
    }

    unregisterTargeted = pipe(
      () => {
        unregisterTargeted = null
      },
      registerCancelOnUserScroll(),
      registerTrackScrollState()
    )
  }

  const unregisterMain = pipe(registerHmr(), registerSessionUnload())

  const dispose = () => {
    unregisterMain()
    if (unregisterTargeted) unregisterTargeted()
  }

  return { dispose, navigate, setTarget }
}
