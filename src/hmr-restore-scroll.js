// NOTE this is mostly irrelevant for focused view pages, but it becomes
// important for docs / long pages

const hook = () => {
  let scrollTopBefore = null

  if (typeof import.meta.hot !== 'undefined' && import.meta.hot.beforeUpdate) {
    import.meta.hot.beforeUpdate(() => {
      scrollTopBefore = document.body.scrollTop
    })

    import.meta.hot.afterUpdate(() => {
      requestAnimationFrame(() => {
        document.body.scrollTop = scrollTopBefore
      })
    })
  }
}

let hooked = false

export default () => {
  if (!hooked) {
    hook()
    hooked = true
  }
}
