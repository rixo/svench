```js
import svench, { preprocessor as svenchPreprocessor } from 'svench/rollup'

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
