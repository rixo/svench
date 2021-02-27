// export const ENTRY_URL = Symbol('Svench.entryUrl')
export const ENTRY_URL = {
  Symbol: 'Svench.entryUrl',
}

ENTRY_URL.toString = () => '===%%%_SVENCH_ENTRY_URL_%%%==='

export const SVENCH_META_START = '<!--<<<svench_m€ta::✂️✂️✂️'
export const SVENCH_META_END = '✂️✂️✂️::svench_m€ta>>>-->'

export const SVENCH_CONFIG_FILE = 'svench.config.js'

export const SNOWPACK_PLUGIN = 'svench/snowpack'

export const VITE_PLUGIN_NAME = 'svench:vite'
