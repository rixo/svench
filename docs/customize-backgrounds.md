# Customize backgrounds

`.svench/svench.js`

```js
...

start({
  // NOTE the default empty / transparent option is always injected first
  backgrounds: [
    // any CSS color
    '#f00',
    'green',
    'blue',

    // an alias (cf. backgroundAliases)
    '@custom',

    // an object for complete control
    {
      label: 'White',
      value: '#fff',
      dark: false, // decides foreground text color
    }
  ],

  // defaults to background, if not provided
  canvasBackground: ['skyblue', 'lightskyblue'],

  backgroundAliases = {
    '@custom': 'skyblue',

    // NOTE you can customize the default canvas's empty pattern this way
    '@none':
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dOxDQBACAJA/b1Y54dyHRZzBQoLY6Am1xCS5A8hAErpvRiOQYMbwFSL6qM8isGTYAOhNQbW5Q4iGwAAAABJRU5ErkJggg==)',
  },
})
```
