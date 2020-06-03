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
  canvasBackgrounds: [
    'hsl(0, 0%, 0%)',
    'hsl(0, 0%, 25%)',
    'hsl(0, 0%, 50%)',
    'hsl(0, 0%, 75%)',
    'hsl(0, 0%, 100%)',
  ],

  backgroundAliases: {
    '@custom': 'skyblue',

    // NOTE you can customize the default canvas's empty pattern this way
    '@none':
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dOxDQBACAJA/b1Y54dyHRZzBQoLY6Am1xCS5A8hAErpvRiOQYMbwFSL6qM8isGTYAOhNQbW5Q4iGwAAAABJRU5ErkJggg==)',
  },

  // you can also change initial values
  // NOTE you need to clear the values from your URL query string to see effect
  background: '#fff',
  canvasBackground: '@none',
})
```
