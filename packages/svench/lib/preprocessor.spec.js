import { test } from 'zorax'
import { preprocess } from 'svelte/compiler'
import dedent from 'dedent'

import preprocessor from './preprocessor.js'

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



    <View source="bla bla bla" name={"View 1"}>
      <Cmp foo="42" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "View 1"
      ],
      "options": {
        "opt": "foo",
        "bool": true
      }
    }✂️✂️✂️::svench_m€ta>>>-->
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

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
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

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
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

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
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

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
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
    </script>

    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})

test('default view name', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View>
      <Cmp foo="42" />
    </View>

    <View>
      <Cmp foo="43" />
    </View>

    <View name="View 4">
      <Cmp foo="44" />
    </View>

    <View>
      <Cmp foo="45" />
    </View>

    <View name="Conflict!">
      <Cmp foo="46" />
    </View>

    <View name="Conflict!">
      <Cmp foo="47" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name={"View 1"} source={"<Cmp foo=\\"42\\" />"}>
      <Cmp foo="42" />
    </View>

    <View name={"View 2"} source={"<Cmp foo=\\"43\\" />"}>
      <Cmp foo="43" />
    </View>

    <View name="View 4" source={"<Cmp foo=\\"44\\" />"}>
      <Cmp foo="44" />
    </View>

    <View name={"View 4 (1)"} source={"<Cmp foo=\\"45\\" />"}>
      <Cmp foo="45" />
    </View>

    <View name="Conflict!" source={"<Cmp foo=\\"46\\" />"}>
      <Cmp foo="46" />
    </View>

    <View                  name={"Conflict! (1)"} source={"<Cmp foo=\\"47\\" />"}>
      <Cmp foo="47" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "View 1",
        "View 2",
        "View 4",
        "View 4 (1)",
        "Conflict!",
        "Conflict! (1)"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})

test('parse options', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options foo="bar" baz={false} />

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

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {
        "foo": "bar",
        "baz": false
      }
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})

test('auto let:action', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" let:action>
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" let:action actions source={${JSON.stringify(
      '<Cmp foo="42" />'
    )}}>
      <Cmp foo="42" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})

test("auto let:action don't override custom `actions`", macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" actions={false} let:actions>
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" actions={false} let:actions source={${JSON.stringify(
      '<Cmp foo="42" />'
    )}}>
      <Cmp foo="42" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})

test('with unicode char', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    🔬

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    🔬

    <View name="whatever" source={${JSON.stringify('<Cmp foo="42" />')}}>
      <Cmp foo="42" />
    </View>

    <!--<<<svench_m€ta::✂️✂️✂️{
      "views": [
        "whatever"
      ],
      "options": {}
    }✂️✂️✂️::svench_m€ta>>>-->
  `,
})
