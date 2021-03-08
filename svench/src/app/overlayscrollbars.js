/* global OverlayScrollbars */
import 'overlayscrollbars'

export default el => {
  OverlayScrollbars(el, {
    scrollbars: {
      autoHide: 'move',
    },
  })
}
