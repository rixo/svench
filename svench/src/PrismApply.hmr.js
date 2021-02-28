if (import.meta.hot && import.meta.hot.afterUpdate) {
  import.meta.hot.afterUpdate(() => {
    for (const cb of callbacks) {
      cb()
    }
  })
}

const callbacks = []

export default callback => {
  callbacks.push(callback)
}
