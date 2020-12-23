const f /* files */ = [
  { // f[0]
    path: "/TODO",
    import: () => import("/dist/TODO.svench.svx"),
    "id": "fztyml",
    "ext": ".svench.svx",
    "dir": "",
    "segment": "TODO",
    "sortKey": "TODO",
    "title": "TODO",
    "canonical": "/TODO",
    "options": {},
    "views": []
  },
  { // f[1]
    path: "/App",
    import: () => import("/dist/App.svench.svelte"),
    "id": "wk2mqm",
    "ext": ".svench.svelte",
    "dir": "",
    "segment": "App",
    "sortKey": "App",
    "title": "App",
    "canonical": "/App",
    "options": {},
    "views": [
      "defaults"
    ]
  }
]

const d /* dirs */ = []

for (const g of [f, d])
  for (const x of g) x.children = x.children ? x.children() : []

const routes = [...f, ...d]

const tree = {
  path: "/",
  isRoot: true,
  "id": undefined,
  "ext": undefined,
  "dir": undefined,
  "segment": undefined,
  "sortKey": undefined,
  "title": undefined,
  "canonical": undefined,
  children: [
    f[1],
    f[0]
  ]
}

export { f as files, d as dirs, routes, tree }
