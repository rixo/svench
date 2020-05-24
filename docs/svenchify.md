# Svenchify

```js
import { svenchify } from 'svench/rollup'
```

The `svenchify` util helps you inject the Svench plugin and customize your Rollup & Svelte config with minimal to no tampering with your actual `rollup.config.js` file.

It also features more aggressive defaults than the plugin, in the hope of being able to spin a "working" Svench with minimal or no specific config.

To achieve its goals of simplicity, `svenchify` uses some [proxyquire](https://github.com/thlorenz/proxyquire) and [esm](https://github.com/standard-things/esm#readme) magic, which is not ultra optimal. You may want to disable it eventually, when you're comfortable enough to integrate the plugin into your config (or use the lighter version of `svenchify`, with the `noMagic: true` option).

The real goal of the `svenchify` util is to get you started with minimal friction but, to get the most out of Svench, you'll still probably need to learn how to configure it yourself.

## Examples

### Minimal `rollup.config.svench.js`

```js
import { svenchify } from 'svench/rollup'

export default svenchify('./rollup.config.js')
```

### `rollup.config.svench.js`

```js
import { svenchify } from 'svench/rollup'

const svenchConfig = {
  // --- svenchify options ---

  // use esm (https://www.npmjs.com/package/esm) to load your Rollup config;
  // this is probably required if your config is in ES format
  esm: false,
  // intercept rollup-plugin-svelte or rollup-plugin-svelte-hot with proxyquire,
  // to know and temper with Svelte config -- e.g. preprocessors, extensions...
  interceptSveltePlugin: false,
  // set esm and interceptSveltePlugin defaults to false
  noMagic: true,

  // override Svelte plugin options (if intercepted)
  svelte: {
    preprocess: processors => [...processors],
  },

  // --- plugin options ---

  dir: 'src',
  extensions: ['.svench', '.svench.svelte', '.svench.svx'],

  override: {
    input: '.svench/svench.js',
    output: {
      dir: '.svench/build',
      format: 'es',
    },
  },

  index: {
    source: 'public/index.html',
    // NOTE we need to add type="module" to use script in ES format
    replace: {
      '<script defer src="/build/bundle.js">':
        '<script defer type="module" src="/svench/svench.js">',
      'Svelte app': 'Svench app',
    },
    write: '.svench/build/svench.html',
  },

  server: {
    public: '.svench/build',
    host: '0.0.0.0',
    port: 4242,
    index: 'svench.html',
  },
}

export default svenchify('./rollup.config.js', svenchConfig)
```

### Sapper

Avoid magic, for advanced multi build setups like Sapper, by wrapping your Svelte plugin with `svenchify.svelte`.

`rollup.config.js`

```js
import { svenchify } from 'svench/rollup'
import svelte from 'rollup-plugin-svelte-hot' // or rollup-plugin-svelte

export default {
  client: {
    ...
    plugins: [
      ...
      // instead of: svelte({
      svenchify.svelte(svelte, {
        ... // svelte plugin options
      }),
    ]
  },
  server: {
    ...
    plugins: {
      // server uses normal svelte plugin
      svelte({ ... }),
    },
  },
}
```

`rollup.config.svench.js`

```js
import { svenchify } from 'svench/rollup'
import svelteConfig from './rollup.config.js'

export default svenchify(svelteConfig.client, {
  interceptSveltePlugin: false,
  ... // svench config
})
```
