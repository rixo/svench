import dedent from 'dedent'
import { SVENCH_META_START, SVENCH_META_END } from './const'
import { makeNamer } from './name-maker'

// import doesn't play well with esm / zorax
const svelte = require('svelte/compiler')

const cleanExtensions = exts =>
  exts.map(ext => ext.trim()).map(ext => (ext[0] === '.' ? ext : '.' + ext))

const parseExtensions = x =>
  Array.isArray(x) ? cleanExtensions(x) : cleanExtensions(x.split(','))

const defaultExtensions = ['.svench', '.svench.svx', '.svench.svexy']

const extensionMatcher = _extensions => {
  const extensions = parseExtensions(_extensions)
  return x => extensions.some(ext => x.slice(-ext.length) === ext)
}

const first = array => array[0]

const last = array => array[array.length - 1]

const hasName = name => x => x.name === name

// TODO dynamic values :-/
const getAttributeValue = attr =>
  attr.value
    .filter(({ type }) => type === 'Text')
    .map(({ data }) => data)
    .join(' ')

const { stringify } = JSON

const Chars = source => {
  const splices = []
  const appends = []

  const splice = (...args) => {
    splices.push(args)
    return me
  }

  const append = string => {
    appends.push(string)
    return me
  }

  const toString = () => {
    const chars = Array.from(source)
    splices.sort((a, b) => b[0] - a[0])
    splices.forEach(args => chars.splice(...args))
    return chars.join('') + appends.join('')
  }

  const me = { splice, append, toString }

  return me
}

const isDynamicAttr = attr => {
  if (!attr) return false
  if (!Array.isArray(attr.value)) return false
  return attr.value.some(x => {
    switch (x.type) {
      case 'Text':
        return false

      case 'MustacheTag': {
        switch (x.expression.type) {
          case 'Litteral':
            return false
          case 'TemplateLiteral':
            return x.expresssion.expressions.length > 0
          default:
            return true
        }
      }

      default:
        return true
    }
  })
}

const fixMdsvexSillyQuotesInOptions = code =>
  code.replace(/<svench:options\s+.*?\/>/g, match =>
    match.replace(/[“”]/g, '"')
  )

const findViewName = ast => {
  // find View import
  let viewName
  svelte.walk(ast.instance, {
    enter(node) {
      if (viewName) return this.skip()
      switch (node.type) {
        case 'ImportDeclaration':
          const source = node.source.value || node.source.raw
          if (source !== 'svench') break
          const specifier = node.specifiers.find(
            node => node.imported.name === 'View'
          )
          if (!specifier) break
          viewName = specifier.local.name
          break
      }
    },
  })
  return viewName
}

const parseValue = node => {
  if (!node) return

  switch (node.type) {
    case 'Text':
      return node.data

    case 'Literal':
      return node.value

    case 'MustacheTag':
      return parseValue(node.expression)

    case 'ObjectExpression':
      return Object.fromEntries(
        node.properties.map(({ key: { name }, value }) => [
          name,
          parseValue(value),
        ])
      )

    case 'ArrayExpression':
      return node.elements.map(parseValue)
  }

  throw new Error('Failed to parse option')
}

const isLetAction = x => x.type === 'Let' && x.name === 'action'

const isActionsAttribute = x => x.name === 'actions' && x.type === 'Attribute'

const hasOwnActions = attributes => attributes.some(isActionsAttribute)

export const parseSvenchOptions = (ast, filename) => {
  let options
  let start, end

  svelte.walk(ast.html, {
    enter(node) {
      if (node.type === 'Element' && node.name === 'svench:options') {
        if (options) {
          throw new Error(
            `Only one <svench:options> element is allowed (in ${filename})`
          )
        }
        if (node.children.length > 0) {
          throw new Error(
            `<svench:options /> is not allowed to have children (in ${filename})`
          )
        }
        ;({ start, end } = node)
        options = {}
        node.attributes.forEach(attr => {
          options[attr.name] =
            typeof attr.value === 'object'
              ? parseValue(attr.value[0])
              : // <Foo prop />
                attr.value
        })
      }
    },
  })

  return { options, start, end }
}

export default ({ extensions = defaultExtensions } = {}) => {
  const matchExtensions = extensionMatcher(extensions)

  const markup = ({ content, filename }) => {
    if (!matchExtensions(filename)) return null

    // const basename = path.basename(filename)
    // if (basename[0] === '_') return null

    const ast = svelte.parse(fixMdsvexSillyQuotesInOptions(content), {
      filename,
    })
    const chars = Chars(content)
    const names = []
    // const viewIndex = 0

    let hasDynamic = false

    // options
    let options = {}
    {
      const { options: _options, start, end } = parseSvenchOptions(
        ast,
        filename
      )
      if (_options) {
        options = _options
        chars.splice(start, end - start)
      }
    }

    // find View import
    const viewName = findViewName(ast)

    if (viewName) {
      const getName = makeNamer()

      const parents = []

      let dynamicScope = 0

      svelte.walk(ast.html, {
        leave(node) {
          parents.pop()
          switch (node.type) {
            case 'EachBlock':
            case 'IfBlock':
            case 'AwaitBlock':
              dynamicScope--
          }
        },
        enter(node /* parent, prop, index */) {
          parents.push(node)
          switch (node.type) {
            case 'EachBlock':
            case 'IfBlock':
            case 'AwaitBlock':
              dynamicScope++

            case 'InlineComponent': {
              const { name, children, attributes } = node
              if (name === viewName) {
                // const index = viewIndex++
                const extraAttributes = []

                // // <svench:view => <SvenchView
                // chars.splice(node.start, name.length + 1, '<SvenchView ')
                // // </svench:view> => </SvenchView>
                // chars.splice(last(children).end + 2, name.length, 'SvenchView ')

                // name
                const nameAttr = attributes.find(hasName('name'))
                const wantedName = nameAttr ? getAttributeValue(nameAttr) : null
                const actualName = getName(
                  nameAttr ? getAttributeValue(nameAttr) : null
                )
                names.push(actualName)

                if (wantedName !== actualName) {
                  if (wantedName !== null) {
                    chars.splice(
                      nameAttr.start,
                      nameAttr.end - nameAttr.start,
                      ' '.repeat(nameAttr.end - nameAttr.start)
                    )
                  }
                  extraAttributes.push(`name={${stringify(actualName)}}`)
                }

                // autodetect dynamic
                if (dynamicScope > 0 || isDynamicAttr(nameAttr)) {
                  hasDynamic = true
                }

                // autodetect actions
                const hasAction = attributes.some(isLetAction)
                if (hasAction && !hasOwnActions(attributes)) {
                  extraAttributes.push('actions')
                }

                // source
                const hasOwnSource = attributes.some(hasName('source'))
                if (!hasOwnSource) {
                  const source =
                    children && children.length > 0
                      ? dedent(
                          content.slice(
                            first(children).start,
                            last(children).end
                          )
                        )
                      : ''
                  extraAttributes.push(`source={${stringify(source)}}`)
                }

                // extra attributes
                if (extraAttributes.length > 0) {
                  chars.splice(
                    first(children).start - 1,
                    0,
                    ' ' + extraAttributes.join(' ')
                  )
                }
              }
            }
          }
        },
      })
    }

    if (hasDynamic && options.dynamic == null) {
      options.dynamic = true
    }

    chars.append(
      [
        '\n\n',
        SVENCH_META_START,
        JSON.stringify({ views: names, options }, false, 2),
        SVENCH_META_END,
      ].join('')
    )

    const code = chars.toString()

    return { code }
  }

  return { markup }
}
