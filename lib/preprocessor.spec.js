import { test } from 'zorax'
import { preprocess } from 'svelte/compiler'
import dedent from 'dedent'

import { preprocess as preprocessor } from './index.js'

// describe.skip('PENDING')

const defaultSource = `
    <script>
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <svench:view>
      <Cmp foo="42" />
    </svench:view>
`

const defaultFilename = '/projects/foo/src/test.svench'

const macro = async (
  t,
  {
    filename = defaultFilename,
    source = defaultSource,
    expected = defaultSource,
  } = {}
) => {
  const { code } = await preprocess(dedent(source), [preprocessor()], {
    filename,
  })
  t.eq(code, dedent(expected.replace('\\n', '%N')).replace('%N', '\\n'))
}

test('does not transform non matching extensions', macro, {
  filename: '/foo/test.svelte',
})

test('does not replace provided source', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <View source="bla bla bla">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <View source="bla bla bla" name={"View 1"}>
      <Cmp foo="42" />
    </View>

    <script context="module">
      export const __svench_id = "1dcdr30"
      export const __svench_views = ["View 1"]
    </script>
  `,
})

test('with import', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" source={${JSON.stringify('<Cmp foo="42" />')}}>
      <Cmp foo="42" />
    </View>

    <script context="module">
      export const __svench_id = "1dcdr30"
      export const __svench_views = ["whatever"]
    </script>
  `,
})

test('multiple source nodes', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
      <Cmp foo="43" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" source={${JSON.stringify(
      '<Cmp foo="42" />\n<Cmp foo="43" />'
    )}}>
      <Cmp foo="42" />
      <Cmp foo="43" />
    </View>

    <script context="module">
      export const __svench_id = "1dcdr30"
      export const __svench_views = ["whatever"]
    </script>
  `,
})

test('with aliased import', macro, {
  source: `
    <script>
      import { View as Story } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <Story name="whatever">
      <Cmp foo="42" />
    </Story>
  `,
  expected: `
    <script>
      import { View as Story } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <Story name="whatever" source={${JSON.stringify('<Cmp foo="42" />')}}>
      <Cmp foo="42" />
    </Story>

    <script context="module">
      export const __svench_id = "1dcdr30"
      export const __svench_views = ["whatever"]
    </script>
  `,
})

test('does not read source from other View component', macro, {
  source: `
    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>

    <script context="module">
      export const __svench_id = "1dcdr30"
      export const __svench_views = []
    </script>
  `,
})

test('adds id to file with context module', macro, {
  source: `
    <script context="module">
      const foo = 12
    </script>

    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script context="module">
      const foo = 12
    ;export const __svench_id = "1dcdr30"; export const __svench_views = []</script>

    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
})
