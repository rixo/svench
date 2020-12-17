/**
 * NOTE unused for now
 */

export default ({ router }) => {
  const mousemove = e => {
    if (e.target.tagName !== 'A') return
    if (e.target.dataset.prefetched) return
    e.target.dataset.prefetched = true
    const { href } = e.target
    if (!href) return
    const route = router.findRoute(href)
    if (!route) return
    if (!route.import) return
    if (route.$resolved) return
    Promise.resolve(route.import())
      .then(() => {
        route.$resolved = true
      })
      .catch(() => {
        e.target.dataset.prefetched = false
      })
  }

  return mousemove
}
