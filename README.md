# Svench

> A lightweight workbench to develop your Svelte components in isolation.

**WORK IN PROGRESS**

## Running the example

```bash
git clone git@github.com:rixo/svench.git
cd svench/example
yarn
yarn svench
```

## Usage

Add `.svench` files to the `src` directory to add pages to your style book.

Those are normal Svelte files, `.svench` is just a special extension to identify pages of the book. It makes it possible to collocate the Svench files beside the component they illustrate (which I like to do) with reduced mess in your actual sources.

The example is also configured with [MDsveX](https://github.com/pngwn/MDsveX), so you can add `.svench.svx` files too!

Inside a `.svench` file, you define some "views" that each represents a possible state of your component.

```html
<script>
  import { View } from 'svench'

  import Foo from './Foo.svelte'

  // use the powers of Svelte to your advantage
  const defaults = { x: 1 }
</script>

<View name="default">
  <Foo {...defaults} />
</View>

<View name="other">
  <Foo {...defaults} other />
</View>

<!-- you can provide a code snippet to be displayed alongside your view -->
<View name="other" source="<p>Code example</p>">
  <p>Code example</p>
</View>
```

## Adding Svench to your project

Reminder: Svench is currently under heavy development. You're very welcome to experiment with it (thanks for your interest by the way!) and share your feedback, but everything is probably going to change before a stable version is out.

That being said, since v0.0.2, Svench provides a Rollup plugin that you can drop into your own project... and see how it works for you ;)

Svench also features a Svelte preprocessor that only job is to extract source code examples from the `View` components. The preprocessor is not required (but obviously, you won't get automatic code examples without it).

### Installation

```bash
npm install -D svench
```

### Configuration

See the [`rollup.config.js`](./example/rollup.config.js) in the example folder for a working example.

```js
import svench from 'svench/rollup'

export default {
  ...,
  plugins: [
    svench({
      // pick your poison
      extensions: [
        // simple, to the point
        '.svench',
        // if your build supports Mdsvex, treat yourself to some "literate"
        '.svench.svx',
        // if you don't want to configure your IDE for .svench support
        '.svench.svelte',
      ],
    }),

    svelte({
      ...
      // you need Svelte to catch the extensions you want to support
      extensions: ['.svelte', '.svench', '.svx'],

      preprocess: [
        // you do NOT need Mdsvex to run Svench... but the 2 combine very well:
        // treat yourself to some "literate" component dev in isolation!
        mdsvex({ extension: '.svx' }),

        // preprocessor is only needed to automatically extracts source code
        // from View components
        svench.preprocess({
          extensions: ['.svench', '.svench.svx'],
        }),
      ],
    }),

    ...
  ]
}
```

## Recipes

### Render a component unencombured by Svench

Useful for die hard testing: when rendered in iframe / isolated mode, only your own DOM elements will appear in the iframe. Nothing Svench. There will still be a bit of logic for basic routing.

On the other hand, you won't be able to have multiple views in a single component (and, obviously, non-present views won't appear in the navigation, etc.).

Just don't use anything Svench in your `.svench` file:

```html
<p>I am `simple.svench`</p>
```
