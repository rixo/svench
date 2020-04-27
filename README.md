# Svench

> A lightweight workbench to develop your Svelte components in isolation.

---

<p align="center">
  <strong>WORK IN PROGRESS</strong>
</p>

---

## Status

This is very much a work in progress. Actually, it's still little more than a POC for now.

You're welcome to reach to me via Svelte's Discord channel or issue to contribute ideas (or more)!

## Goals

Svench is very opinionated. It's opinion is that it should not get in the way.

- Easy to use, fast to run (and fast to npm install too).

- Made for Svelte, with Svelte. A Svench component is a normal Svelte component. All Svelte features (slots, context, events...) are available in your isolated views, with normal Svelte syntax.

- Integrate with your existing project's build setup (only Rollup for the times being). Avoid duplication of your build config (or shoehorning your plugins into Svench's own config, if it had one of its own).

- Encourage documenting along development -- by making it easy to mix textual content (e.g. [Mdsvex](https://github.com/pngwn/MDsveX)) and views declaration.

- Being able to render an individual view with minimal DOM pollution and interference, to make them usable as test fixtures.

- Highly customizable. Can run as a standalone app, but can also be integrated as part of a larger app (e.g. for style guide oriented usage).

- Highly composable. Svench aims to provide good enough default config and parts to get you started as fast as possible, but any part beyond the core should be easy to replace with your own, to achieve advanced customization, or integration into any existing setup.

- This one is just a dream for now: integrate a zero-config browser-first testing workflow, that can then also be run in node and CI (e.g. with jsdom, puppeteer... this last part wouldn't be zero-config though, there are limits to what one can dream!).

- Also, for people who cares, Svench has over the top HMR support.

## Running the demo

```bash
git clone git@github.com:rixo/svench.git
cd svench/example
yarn
yarn svench
```

Open http://localhost:4242. Edit / add things in `example/src`.

## Usage example

Declare views with the `<View>` component.

`Foo.svench`

```html
<script>
  import { View } from 'svench'
  import Foo from './Foo.svelte'
</script>

<View name="default">
  <Foo />
</View>

<View name="big">
  <Foo big>
    <p>Svench supports what Svelte supports. Here slot.</p>
  </Foo>
</View>

<p>
  Arbitrary extra content is allowed and will be scrapped as needed (with some
  caveats -- e.g. if you want to use your views as test fixtures).
</p>
```

Use the `<Render>` component to display views anywhere outside of the file where they are declared.

`Foo.svench.svx`

```markdown
<script>
  import { Render } from 'svench'
  import Foo from './Foo.svench'
</script>

# Foo

> A good demo is worth a thousand words, yet they can't tell the whole story!

Svench wants to facilitate taking notes, explaining intentions, writing docs
bit, etc. **at the best time to do it**: when you are actively in the process of
developping your component.

<Render src={Foo} view="default" />

You can also reference external views by raw string path (but it kind of makes
me cringe):

<Render src="./Foo" view="big" />

It can be handy to render everything at once, though. Hmm :thinking: ...

<Render src="./foo/*" />
```

## Installation

```bash
npm install -D svench
```

## Configuration

The Svench plugin aims to fulfill two distinct missions. first, running Svench's core operations and, secondly, integration into your project.

Svench's core operations consist of traversing FS to collect Svench components, watching, reading code to extract views's source code, etc.

The integration part aims at helping you reuse your existing Rollup config and, more generally, to run a second web app (i.e. Svench) beside your actual app. Again, with the same build config. The plugin provides a set of helpers, some "mini plugins" of sort, designed to work together to (more) easily achieve this goal. All of these helpers are optional, and you can easily replicate what they're doing if you know your way around a Rollup config.

### Example

Let's start with a synthetic example. Don't worry if it doesn't immediately makes sense for you, you'll find more detailed explanations just after.

See the [`rollup.config.js`](./example/rollup.config.js) in the example folder for a working example.

```js
import svelte from 'rollup-plugin-svelte-hot'
import svench from 'svench/rollup'

const preprocess = [
  // you do NOT need Mdsvex to run Svench... but the 2 combine very well:
  // treat yourself to some "literate" isolated-component-dev!
  mdsvex({ extension: '.svx' }),
]

export default {
  ...,
  plugins: [
    svench({
      // === Core ===

      // When `false`, the Svench plugin does nothing at all
      enabled: !!process.env.SVENCH,

      watch: !!process.env.ROLLUP_WATCH,

      // The root dir that Svench will parse and watch (default: './src')
      dir: './src',

      // Pick your poison... (default: ['.svench', '.svench.svelte'])
      extensions: [
        // simple, to the point
        '.svench',
        // if you don't want to configure your IDE for .svench support
        '.svench.svelte',
        // in this example, we're also leveraging Mdsvex for Svench components
        '.svench.svx',
      ],

      // The Svench plugin does some code transform, and so it needs to know of
      // your preprocessors to be able to parse your local Svelte variant. This
      // needs to be the same as the Svelte plugin.
      preprocess,

      // === Integration ===

      // This example writes Svench to a single iife file

      // Override Rollup's config when Svench is enabled
      override: {
        // replace your entry with Svench's one (override.input is the only
        // option that gets a special treatment from Svench: if you set it to
        // true, it will be replaced with Svench's entry point file path)
        input: true,
        // inlining `import(...)` from Svench's codebase is required for iife
        inlineDynamicImports: true,
        // output to another file
        output: {
          file: 'public/build/svench.js',
        },
      },

      // Generate an HTML bootstrap for Svench
      index: {
        // Start from your own index.html
        source: 'public/index.html',
        // This does dumb full text replacements (maybe we'll go with something
        // more elaborate in the future!)
        replace: {
          // Replace your entry script with Svench's one in index.html
          '/build/bundle.js': '/build/svench.js',
          'Svelte app': 'Svench app',
        },
        // Write the result to disk (if you don't use Svench dev server, or if
        // you want to build your Svench workbench as a standalone app)
        output: 'public/svench.html'
      },

      // Ad-hoc web server
      serve: {
        host: 'localhost',
        port: 4242,
        // Path to the directory that will be served.
        public: 'public',
        // You can serve a custom index, but if you want to use the file
        // generated by the index helper above, it's better to leave this blank,
        // because then it will be served from RAM
        // index: 'svench.html',
      },
    }),

    svelte({
      // you need Svelte to catch the extensions you want to support
      extensions: ['.svelte', '.svench', '.svx'],
      preprocess,
      ...
    }),

    ...
  ]
}
```

### Integration

The core options are pretty self explanatory but integrating into your project and config is another level of complexity... All options are listed bellow for quick reference, but let's start with some explanations about what you'll be trying to achieve with them.

Basically, Svench is a normal Svelte app. Specifically, an SPA (Single Page Application) with client-side routing. It has its own entry point (that's the [svench.js](<[https://github.com/rixo/svench/blob/master/svench.js](https://github.com/rixo/svench/blob/master/svench.js)>) file, at the root of the package). It also needs its own `index.html` bootstrap...

But, to be useful, this app also need to be able to build and use your own components, which means it must reuse your existing setup somehow. And, of course, you must be able to keep using your Rollup config normally for your own app.

In a nutshell, here's what we need to do:

- override your config when Svench is running

  - replace `input` with Svench's entry point (alternatively: add it, if you want to run both your app and Svench with the same Rollup build process)

  - change `output` to write Svench's bundle to its own file, and make sure your output format, etc. are compatible with Svench's code base

- (optionally) generate an `index.html` (or `svench.html`) file that reuses the same stylesheets and external scripts as your own

- serve all this to the browser

#### Override

The principle of the override options is that when the Svench plugin is not enabled, it's like if it was not there. It does nothing at all, your config just works normally. When the plugin is enabled, the overrides are applied, allowing us to make the config compatible with Svench's need.

What's cool with this, is that the Svench plugin shares your real config. You don't have to try and replicate it now, and won't have to do so when it evolves in the future.

Note: `override.input` gets a special treatment. If you set it to `true`, it will be replaced by Svench's default entry point.

`override.output` is kind of a special case, too. Since Rollup makes a difference between input options and output options, `override.output` will get _merged_ into your existing `output` option.

All the other props you have in your `override` will get flatly copied over your existing config.

#### Input

Svench needs its own entry point. There's 2 way to slice this cake, depending on whether you want to run Svench with its own separate Rollup process, or if you want to run a unique build process for both.

This consideration is mostly important for dev run (and watch). The latter approach can avoid running essentially the same build twice in parallel. On the other hand, the first one is probably easier to implement. Also, in theory, a standalone build for Svench should be faster (considering only Svench), since your app is supposed to do more than just rendering UI components, it should have more to build than what is needed for just Svench...

So, for the first solution, independent builds, you just need to override your entry point:

```js
svench({
  ...
  override:
    input: true, // true gets converted to the location of Svench's entry file
  }
})
```

The single build approach is supported with a dedicated option: `addInput`. As opposed to `override.input`, that will replace your existing `input`, `addInput` will _append_ Svench's entry file to your existing `input`. If it is not already an array, it will be turned into one.

```js
svench({
  ...
  addInput: true,
})
```

Multiple entry points are very well supported by Rollup, but they might require some deeper adaptations to your project, if it's not already for them. In particular, you'll need to use `output.dir` instead of `output.file`, and an `output.format` that supports code splitting. More on that in the next section.

A note on the entry file: you can pass `true` to use Svench's default entry point, or you can pass a string with a path to a custom file you want to use. The default entry point doesn't do a whole lot, and you might want to customize it. In essence, it just renders a new `Svench` component to the body.

```js
new Svench({ target: document.body })
```

Here's its whole code (imports have been adapted to what you'd use in a custom file):

```js
import { Svench } from 'svench'

// use preconfigured Prism bundle
import 'svench/prism'

const app = new Svench({ target: document.body })

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })
  import.meta.hot.accept()
}
```

#### Output

With our entry point in place, we now need to tweak the `output` option a little bit. You probably don't want to overwrite your app's bundle with Svench's one. And we also need to make sure your build config can support Svench's codebase.

##### With code splitting

Svench's codebase, as well as the generated JS file listing all your Svench component, use code splitting, that is dynamic imports. If you want to preserve code splitting (including if you decided to use multiple entry points), here's what you need:

- use `output.dir` (and not `output.file`)
- use an `output.format` that supports dynamic imports, like `'es'`
- add the `type="module"` attribute to your `<script>` tag in your `index.html`

See [this StackOverflow answer](https://stackoverflow.com/a/60026703/1387519) for a detailed explanation on how to do code splitting with Rollup. There are also instructions for support of legacy browsers in there.

For Svench, it would look something like this:

```js
svench({
  override: {
    // override.output gets _merged_ into your existing output options
    {
      file: null, // if you are using output.file, you need to remove it
      dir: 'public/svench',
      format: 'es'
    }
  }
})
```

Note that if you want the single build workflow, that means that your app will be built to `'es'` format too. In turn, this will require that you use `type="module"` in _your app's `index.html`_. It might be a deal breaker for the single build workflow, if your app is not already into that...

##### Without code splitting

If you're not interested in code splitting, you can use Rollup's ([`inlineDynamicImports`](https://rollupjs.org/guide/en/#inlinedynamicimports)) option. With this, you can output to a file, an iife...

```js
export default {
  ...
  output: {
    file: 'public/build/bundle.js',
    format: 'iife',
    name: 'app',
    sourcemap: true,
  },
  plugins: [
    svench({
      override: {
        inlineDynamicImports: true,
        output: {
          file: 'public/build/svench.js',
        }
      }
      ...
    })
    ...
  ]
}
```

#### index.html

Now that we're done generating a bundle for our Svench app, we need to consume it! And for that, we need a HTML file.

Svench ships with a very basic HTML file that it will use by default (with its internal web server). However, your own `index.html` can contain stylesheets and other scripts that are needed to render your components correctly. If that's the case, you'll probably want to avoid duplicating this.

To help with that, Svench includes a dumb copy with replace util. The idea is that you copy your existing `index.html` and replace a few bits like the entry point script. It's not rocket science, but it should do...

```js
svench({
  index: {
    source: 'public/index.html',
    // you can also pass a replace function, for more control
    replace: {
      '/build/bundle.js': '/build/svench.js',
      'Svelte app': 'Svench app',
    },
    // writing the generated file is only needed if you don't use the internal
    // web server (see bellow), or really want to build & publish your workbench
    write: 'public/svench.html',
  },
})
```

#### Web server

Now that we have a JS file and a HTML file, we need to send them to the browser, for best effect!

You might be tempted to reuse the server you're already using for serving your app, and it should work... At first. The problem is that Svench is an SPA using client side routing and, as such, it needs its index file to be served for any unmatched URL on the server. If your own app has the same need, there will be conflict.

Since Svench has very basic serving needs, and we've already asked so much from you setup wise, the Svench plugin ships with its own tiny static file server that you can use and be done with it.

Note: the server will only fire in watch mode (this is controlled with the plugin's [`watch`](#watch) option).

```js
serve: {
  host: '0.0.0.0',
  port: 2424,
  public: 'public',
}
```

If you use the index generator util, the web server will know to use this as its index (and fallback, for client-side routing). Otherwise, you'll also need to provide the URL (relative to the public directory) to the file you want to use with the `server.index` option.

If you do want to use the file generated with the index helper, however, leave the `server.index` option empty. Even if your generated file is written to disk. Otherwise, the index file will be reading from disk each time your (re)load your Svench page instead of being saved from RAM. It's wasteful.

And with that, you should be ready to go and read about all the available option! Given the time it took me to write all this, I think you owe me that... Kidding! Go try your Svench!

Fire Rollup in watch mode, making sure the `enabled` option of the Svench plugin is met, and enjoy! It should be a command like that:

```bash
SVENCH=1 rollup -cw
```

## Options

### Core options

#### enabled

Type: `bool`<br>
Default: `!!process.env.SVENCH`

When not enabled, the plugin does nothing at all.

#### dir

Type: `string`<br>
Default: `'src'`

The directory that Svench need to traverse (and watch, if applicable) to find your Svench components.

#### extensions

Type: `string[]`<br>
Default: `['.svench', '.svench.svelte']`

Only the files matching one of these extensions will be picked as Svench components. The matching extension will also be dropped from the component's name generated from its filename.

#### preprocess

Type: `function[]`<br>
Default: `undefined`

Svench need to be able to parse your Svench components (i.e. as Svelte components). For that, it needs to know the preprocessors you use. This needs to be the same as what you're using in the Svelte plugin.

#### watch

Type: `bool`<br>
Default: `!!process.env.ROLLUP_WATCH`

Whether to watch the file system for changes. The default is to watch when Rollup itself watches.

### Integration options

#### override

Type: `object`<br>
Default: `undefined`

Apply some overrides to your Rollup config when the Svench plugin is enabled.

You most probably need to change the `input` to Svench's own entry point. The file path of Svench default entry point can be accessed with `svench.entry`. You can also provide your own bootstrap file if you want, for advanced scenarios.

If you set `override.input` to `true`, then it will automatically be replaced by Svench's entry point.

As an alternative to `override.input`, you can use the `addInput` option (see bellow) if you want to run both your app and Svench with the same Rollup build process.

You may also need to alter your `output` option to make it compatible with code splitting, because Svench's code base uses dynamic imports. Alternatively, you can enable Rollup's [`inlineDynamicImports`](https://rollupjs.org/guide/en/#inlinedynamicimports) option to resolve dynamic imports.

```js
import svench from 'svench/rollup'
...
override: {
  input: svench.entry,
  output: {
    file: undefined,
    dir: 'public/build/svench',
    format: 'es',
  },
  // you'll need to turn this on, if you want to build Svench to an iife
  inlineDynamicImports: true,
}
```

#### addInput

Type: `bool|string`<br>
Default: `false`

If you want to build both your app and Svench with the same Rollup build process (that is, run only one `rollup -cw` process), you need to have both your app and Svench's entry points in the `input` option.

When this option is `true` (or a string, if you want to use a custom entry file to bootstrap Svench), Svench's entry point will be added to the original one in your config.

If your original `input` is not already an array, it will be changed to an array containing both entry points.

```js
import svench from 'svench/rollup'
...
override: {
  addInput: svench.entry,
}
```

#### preserveOutputFileName

Type: `bool`<br>
Default: `true`

In Rollup, when using `output.file`, you're free to pick any filename you want. However, when using `output.dir`, the name of the produced files is derived from the name of the entry file (from `input`). This means that if your config normally uses `output.file` and you override it to `output.dir` when Svench is enabled, it might be impossible to output your app "bundle" (really bundled entry point) to the same destination file.

When this option is enabled, the generated file for the entry point of your app will be renamed to the originally intended `output.file` after a build completes.

Note that this option only has some effect when all of the following conditions are met: your original config uses `output.file`, and your overridden config uses `output.dir`, and your original `input` is a single file (not an array).

#### index

Type: `object|false`<br>
Default: `false`

In addition to building it's entry point together with your own config, Svench needs a HTML file to bootstrap its web app. Svench ships with a minimal `index.html` and will use that by default. But you may want to reuse your app's `index.html` somehow, because it contains some stylesheets, external scripts, etc. that are needed to render your components correctly.

To help you with that, you can use this `index` helper that provides a basic "copy with replacements" workflow. Copy your `index.html`, replace your entry point script with Svench's own one... And it should do it!

Note that if you also use Svench's `serve` helper (see bellow), the HTML index will be served from RAM, so writing it to disk (with `index.write`) is optional in this case -- for dev, if you want to build your Svench workbook as a standalone app, you'll still need some HTML file!

```js
index: {
  source: 'public/index.html',
  replace: {
    '/build/bundle.js': svench.ENTRY_URL,
    'Svelte app': 'Svench app',
  },
  write: 'public/svench.html',
},
```

#### index.source

Type: `string`<br>
Default: `undefined`

Path to the file containing the source HTML.

#### index.replace

Type: `object|function`<br>
Default: `{}`

Either an object with strings to search for as keys, and replacements as value, or a function to apply any arbitrary transformation.

When you pass a function, it will receive the contents string as its first argument, and an object with an `entryUrl` property, with the URL to Svench's entry point script.

Note that the entry point URL can only be computed if Svench knows the file system path to your public directory, that you need to specify with option `index.public`, or will be taken from option `serve.public`, if available.

```js
index: {
  source: 'public/index.html',
  replace: (contents, { entryUrl }) => contents.replace('/build/bundle.js', entryUrl),
}
```

#### index.write

Type: `string`<br>
Default: `undefined`

Path to the destination file you want to write the result.

#### index.public

Type: `string`<br>
Default: `serve && serve.public`

Path to your public directory. This is needed to automatically compute `svench.ENTRY_URL`.

#### serve

Type: `object|bool`<br>
Default: `false`

Svench ships with a web server that you can use during development. It is very basic, but it is perfectly adapted to Svench's very basic needs, and it can avoid you from searching your own solution and clutter your project.

Note: the server only fires in watch mode, as controlled by the [`watch`](#watch) option.

```js
serve: {
  host: '0.0.0.0',
  port: 2424,
  public: 'public',
}
```

#### serve.host

Type: `string`<br>
Default: `localhost`

#### serve.port

Type: `int`<br>
Default: `4242`

#### serve.public

Type: `string`<br>
Default: `public`

Path to the directory you want to serve from.

#### serve.index

Type: `string`<br>
Default: `undefined`

You can specify a custom file to be used as index.

Note that if you want to use the file generated by the `index` helper (see above), it's better to leave this option empty, even if the generated file is written to disk. This will serve the file from RAM instead of rereading from the disk on each reload.

## Usage

**TO BE DONE**

Add `.svench` files to the `src` directory to add pages to your workbench.

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

## Recipes

This section is more of a TODO list of things not to forget to document, eventually.

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

### Render a component unencumbered by Svench things

TODO document `raw`

Useful for die hard testing: when accessed from direct URL to the "raw" view, only your own DOM elements will appear in the document. Nothing Svench. There will still be a bit of logic for basic routing and view extraction.

```html
<p>I am `simple.svench`</p>
```
