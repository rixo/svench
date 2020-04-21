const fs = require('fs')
const { preprocess, parse, walk } = require('svelte/compiler')
const dedent = require('dedent')

// const _inspect = x =>
// console.log(require('util').inspect(x, { colors: true, depth: 99 }))

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

const parseSvenchOptions = (ast, filename) => {
  let options
  walk(ast.html, {
    enter(node) {
      if (node.type === 'Element' && node.name === 'svench:options') {
        if (options != null) {
          throw new Error(
            `Only one <svench:options> element is allowed (in ${filename})`
          )
        }
        options = {}
        node.attributes.forEach(attr => {
          options[attr.name] = parseValue(attr.value[0])
        })
      }
    },
  })
  return options || {}
}

const findViewName = ast => {
  // find View import
  let viewName
  walk(ast.instance, {
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

const first = array => array[0]

const last = array => array[array.length - 1]

const hasNamed = name => x => x.name === name

const getAttributeValue = attr =>
  attr.value
    .filter(({ type }) => type === 'Text')
    .map(({ data }) => data)
    .join(' ')

const parseViews = (content, ast) => {
  const viewName = findViewName(ast)

  if (!viewName) return {}

  const defaultViewName = index => `View ${index + 1}`

  const views = []

  const sources = {}

  walk(ast.html, {
    enter(node /* , parent, prop, index */) {
      switch (node.type) {
        case 'InlineComponent': {
          const { name, children, attributes } = node
          if (name === viewName) {
            // name
            const nameAttr = attributes.find(hasNamed('name'))
            const actualName = nameAttr
              ? getAttributeValue(nameAttr)
              : defaultViewName(views.length)

            views.push(actualName)

            // source
            const ownSource = attributes.find(hasNamed('source'))

            if (ownSource) {
              // console.log(ownSource.value[0])
              // console.log(parseValue(ownSource.value[0]))
              // process.exit()
            } else {
              sources[actualName] =
                children && children.length > 0
                  ? dedent(
                      content.slice(first(children).start, last(children).end)
                    )
                  : ''
            }
          }
        }
      }
    },
  })

  return { views, sources }
}

module.exports = async (preprocessors, filename) => {
  let code = await fs.promises.readFile(filename, 'utf8')

  if (preprocessors) {
    ;({ code } = await preprocess(code, preprocessors, {
      filename,
    }))
  }

  const ast = parse(code, { filename })

  const options = parseSvenchOptions(ast)

  const { views, sources } = !options.dynamic && parseViews(code, ast)

  return { options, views, sources }
}
