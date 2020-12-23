const f /* files */ = [
  { // f[0]
    path: "/App",
    import: () => import("/home/eric/projects/svench/svench/examples/svelte-template/src/App.svench"),
    "id": "1yssmaj",
    "ext": ".svench",
    "dir": "",
    "segment": "App",
    "sortKey": "App",
    "title": "App",
    "canonical": "/App",
    "options": {},
    "views": []
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
    f[0]
  ]
}

export { f as files, d as dirs, routes, tree }
