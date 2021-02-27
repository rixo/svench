# Contributin to Svench

## Installation

```bash
git clone
cd svench
git checkout next # development is active on `next` branch currently
```

### Svench

```bash
cd packages/svench
yarn link
yarn
yarn dev # wathc & rebuild

# watch & rebuild only some parts
#
# targets: app, theme, rollup (rollup plugin), util-esm, prism
#
yarn dev --configTarget app,theme
```

Run (the few) tests:

```bash
yarn test
yarn test --watch
yarn test --help # see all of Zoar's (the test runner) options
```

#### Sub projects

Svench is composed from multiple parts what have to work together...

#### In Node

- `lib/rollup-plugin.js` The plugin for Rollup

- `lib/svenchify.js` The Svenchify util -- that injects the Rollup plugin into an existing config from "the outside", without needing to edit the project's config (and risk breaking it for some users)

- `lib/preprocessor.js` Svench does some static analysis of Svench components to extract View names, sources, etc. when possible (i.e. when views are not dynamic). This needs to be a preprocessor, because we need to see the _Svelte_ code (i.e. not the compiled JS). Also, it needs to be _the last_ preprocessor in the chain (so that it doesn't see the input Markdown of Mdsvex, for example).

#### In the browser

- `src/index.js` The Svench lib itself (the `Svench` component, the `start` util, etc.)

- `src/app` The components composing (the default) Svench's UI: top bar, menu, view boxes, etc. This part is packaged separately because Svench's UI is intended to be "pluggable" -- it is conceived so that some of its components or its whole could be replaced by the user for customization.

- `themes` CSS of the default theme, and the default markdown theme (used in Mdsvex pages, copied from Github). There published both in `.css` (e.g. `themes/default.css`), and `.css.js` "self contained" form.

- `src/app/prism.js` A prebuilt version of Prism (syntax highlighter) that works well with Svench, including a selection of plugin (like Svelte highlighting) and embedded CSS.

### Examples

#### Vite

```bash
cd examples/vite-default-svelte-template
yarn
yarn link svench # optional
# with cli:
yarn svench
```

#### Snowpack

```bash
cd examples/snowpack-csa
yarn
yarn link svench # optional
# "manual" setup:
yarn svench:config
# start with cli:
yarn svench:cli
# or run cli directly:
yarn svench
```

#### Rollup (from sveltejs/template)

```bash
cd examples/svelte-template
yarn
yarn link svench # optional
# "manual" setup:
yarn svench:config
# start with cli:
yarn svench:cli
# or run cli directly:
yarn svench
```

### Rollup (legacy example)

```bash
cd examples/rollup
yarn
yarn link svench
yarn svench # Rollup + rollup-plugin-hot
# or
yarn svench:nollup # Nollup
```
