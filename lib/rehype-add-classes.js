/**
 * cf. https://github.com/martypdx/rehype-add-classes/blob/master/index.mjs
 *
 * Original plugin causes build issues...
 */
import { selectAll } from 'hast-util-select'

export default additions => {
  const adders = Object.entries(additions).map(adder)
  return node => adders.forEach(a => a(node))
}

const adder = ([selector, className]) => {
  const writer = write(className)
  return node => selectAll(selector, node).forEach(writer)
}

const write = className => ({ properties }) => {
  if (!properties.className) {
    properties.className = [className]
  } else if (Array.isArray(properties.className)) {
    if (properties.className.includes(className)) return
    properties.className.push(className)
  } else {
    properties.className += ` ${className}`
  }
}
