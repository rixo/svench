# Svench

> A lightweight workbench to develop your Svelte components in isolation.

## Status

**WORK IN PROGRESS**

This is very much a work in progress. Actually, it's still just a demo / POC for now.

I'm very interested in any idea or feedback, though.

In particular, if you're tempted to try to include and use Svench in your project, feel free to reach to me for help. At this point, I'm still researching the best ways to integrate this tool in the different scenarios and setups it might encounter, so I would be happy to study your specific case and see how to make it fit. Ping me on Svelte's Discord, or open an issue here if you're interested!

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

### Integrate in a larger app (e.g. integrated styleguide)

Use `base` to scope Svench's routing to some specific sub section of your site, and `fallback` to render something else when URL doesn't match `base`.

```html
<script>
  import { Svench } from 'svench'
  import App from './App.svelte'
</script>

<Svench base="/svench" fallback="{App}" />
```

### Syntax highlighting with Prism

Svench is prewired to make good use of Prism for syntax highlighting, yet this is not a hard dependency.

If `Prism` is found in the global scope, it will be used for highlighting of views' code example, and the various Prism-compliant code snippets otherwise present in your (Svench) pages. This means you can use your existing Prism setup, or tune it to your specific needs.

For convenience and ease of use, Svench ships with a bundled version of Prism that works well in most Svench scenarios. It includes Prism's default theme, that plays well with Svench's default theme, the copy code plugin, and grammars for Svelte, JS, HTML (markup), CSS, and markdown.

To use it, just drop an import of `svench/prism.js` in your app, or include the `prism.js` found in the root of the Svench package into your HTML file. Prism's CSS is embedded into this JS file, so you don't need a CSS bundler plugin to use it with `import`.

```js
import 'svench/prism'
```
