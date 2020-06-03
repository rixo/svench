export const parseOptions = ({
  // enabled = !fallback,

  fixed = true,

  defaultViewName = index => `View ${index}`,

  // time before which view index is reset (for HMR)
  registerTimeout = 100,
  renderTimeout = 100,

  // dev mode
  dev = false,

  // app
  menuWidth = 200,
  extrasHeight = 200,

  // ui
  shadow = false,
  centered = true,
  outline = false,
  padding = true,
  fullscreen = false,

  background = '#fff', // view "outline" background
  canvasBackground = '@none',
  backgroundAliases = {
    '@none':
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dOxDQBACAJA/b1Y54dyHRZzBQoLY6Am1xCS5A8hAErpvRiOQYMbwFSL6qM8isGTYAOhNQbW5Q4iGwAAAABJRU5ErkJggg==)',
  },
  backgrounds = [
    { value: '#fff' },
    { value: '#000' },
    { value: '#f00' },
    { value: '#0f0' },
    { value: '#00f' },
    { value: '#ff0' },
    { value: '#f0f' },
    { value: '#0ff' },
    ...Array.from({ length: 21 })
      .map((_, i) => ({
        label: `${i * 5}%`,
        value: `hsl(0, 0%, ${i * 5}%)`,
      }))
      .reverse(),
  ],
  canvasBackgrounds = backgrounds,
}) => ({
  fixed,
  defaultViewName,
  // time before which view index is reset (for HMR)
  registerTimeout,
  renderTimeout,
  menuWidth,
  extrasHeight,
  // dev mode
  dev,
  // ui
  shadow,
  centered,
  outline,
  padding,
  fullscreen,
  canvasBackground,
  background,
  backgroundAliases,
  backgrounds,
  canvasBackgrounds,
})
