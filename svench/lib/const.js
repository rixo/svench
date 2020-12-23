import * as path from 'path'

// export const ENTRY_URL = Symbol('Svench.entryUrl')
export const ENTRY_URL = {
  Symbol: 'Svench.entryUrl',
}

ENTRY_URL.toString = () => '===%%%_SVENCH_ENTRY_URL_%%%==='

export const SVENCH_META_START = '<!--<<<svench_m€ta::✂️✂️✂️'
export const SVENCH_META_END = '✂️✂️✂️::svench_m€ta>>>-->'

// export const ENTRY_PATH = path.resolve(__dirname, '../svench.js')
