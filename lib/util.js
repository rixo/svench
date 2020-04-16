// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
const escapeRe = string => string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

module.exports = {
  escapeRe,
}
