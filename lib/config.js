export const defaultOutput = {
  format: 'es',
  file: null,
  dir: '.svench/build',
  entryFileNames: 'svench.js',
}

export const defaults = {
  enabled: !!process.env.SVENCH,

  watch: !!process.env.ROLLUP_WATCH,

  dir: 'src',

  extensions: ['.svench', '.svench.svelte'],

  override: false,

  mountEntry: '/__svench/svench.js',

  index: true,

  serve: {
    host: 'localhost',
    port: 4242,
    public: '.svench/build',
    index: undefined,
  },
}

export const svenchifyDefaults = {
  ...defaults,

  enabled: true,

  override: {
    input: true,
    output: true,
  },
}
