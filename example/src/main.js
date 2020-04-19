import { Svench } from 'svench'
import 'svench/prism'

const app = new Svench({
  target: document.body,
  props: {
    defaults: {
      padding: true,
    },
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })

  import.meta.hot.accept()

  // DEBUG DEBUG DEBUG move to some good location (preserve scroll on HMR update)
  {
    // NOTE this is mostly irrelevant for focused view pages, but it becomes
    // important for docs / long pages

    let scrollTopBefore = null

    if (import.meta.hot.beforeUpdate) {
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
}
