export const toPx = (value, el) => {
  const match = /^(.*)em$/.exec(value)
  if (match) {
    return (
      match[1] *
      getComputedStyle(el).getPropertyValue('font-size').replace(/px$/, '')
    )
  }
  return value.replace(/px$/, '')
}
