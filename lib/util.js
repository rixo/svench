const pipe = (...fns) => x0 => fns.reduce((x, f) => f(x), x0)

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
const escapeRe = string => string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

module.exports = {
  pipe,
  escapeRe,
}
