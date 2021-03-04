const f /* files */ = [
  { // f[0]
    path: "/_/Installation/config",
    import: () => import("/home/eric/projects/svench/svench/docs/src/02-Installation.svench/config.md"),
    "id": "12u89g",
    "ext": ".md",
    "dir": "Installation",
    "segment": "config",
    "sortKey": "config",
    "title": "config.md",
    "canonical": "/Installation/config",
    "options": {},
    "views": []
  },
  { // f[1]
    path: "/_/Installation/index",
    import: () => import("/home/eric/projects/svench/svench/docs/src/02-Installation.svench/index.md"),
    "id": "1dtr23a",
    "ext": ".md",
    "dir": "Installation",
    "segment": "index",
    "sortKey": "index",
    "title": "index.md",
    "canonical": "/Installation/index",
    "options": {},
    "views": []
  },
  { // f[2]
    path: "/_/Usage/View",
    import: () => import("/home/eric/projects/svench/svench/docs/src/03-Usage.svench/00-View.svench"),
    "id": "i99bec",
    "ext": ".svench",
    "dir": "Usage",
    "segment": "View",
    "sortKey": "00-View",
    "title": "View",
    "canonical": "/Usage/View",
    "options": {},
    "views": []
  },
  { // f[3]
    path: "/_/Usage/Render",
    import: () => import("/home/eric/projects/svench/svench/docs/src/03-Usage.svench/10-Render.svench"),
    "id": "49ijpe",
    "ext": ".svench",
    "dir": "Usage",
    "segment": "Render",
    "sortKey": "10-Render",
    "title": "Render",
    "canonical": "/Usage/Render",
    "options": {},
    "views": []
  },
  { // f[4]
    path: "/_/Usage/index",
    import: () => import("/home/eric/projects/svench/svench/docs/src/03-Usage.svench/index.md"),
    "id": "e586u2",
    "ext": ".md",
    "dir": "Usage",
    "segment": "index",
    "sortKey": "index",
    "title": "index.md",
    "canonical": "/Usage/index",
    "options": {},
    "views": []
  },
  { // f[5]
    path: "/_/Getting_Started/index",
    import: () => import("/home/eric/projects/svench/svench/docs/src/01-Getting_Started.svench/index.md"),
    "id": "fvwnrn",
    "ext": ".md",
    "dir": "Getting_Started",
    "segment": "index",
    "sortKey": "index",
    "title": "index.md",
    "canonical": "/Getting_Started/index",
    "options": {},
    "views": []
  },
  { // f[6]
    path: "/index",
    import: () => import("/home/eric/projects/svench/svench/docs/src/index.md"),
    "id": "1ng6h6z",
    "ext": ".md",
    "dir": "",
    "segment": "index",
    "sortKey": "index",
    "title": "index.md",
    "canonical": "/index",
    "options": {},
    "views": []
  }
]

const d /* dirs */ = [
  { // d[0]
    path: "/_/Getting_Started",
    "id": "lx3fd4",
    "ext": undefined,
    "dir": "_",
    "segment": "Getting_Started",
    "sortKey": "01-Getting_Started",
    "title": "Getting Started",
    "canonical": "/_/Getting_Started",
    children: () => []
  },
  { // d[1]
    path: "/_/Installation",
    "id": "1upnnzk",
    "ext": undefined,
    "dir": "_",
    "segment": "Installation",
    "sortKey": "02-Installation",
    "title": "Installation",
    "canonical": "/_/Installation",
    children: () => [f[0]]
  },
  { // d[2]
    path: "/_/Usage",
    "id": "rpp5z9",
    "ext": undefined,
    "dir": "_",
    "segment": "Usage",
    "sortKey": "03-Usage",
    "title": "Usage",
    "canonical": "/_/Usage",
    children: () => [f[2], f[3]]
  },
  { // d[3]
    path: "/_",
    "id": "b6a7wt",
    "ext": undefined,
    "dir": ".",
    "segment": "_",
    "sortKey": "_",
    "title": " ",
    "canonical": "/_",
    children: () => [d[0], d[1], d[2]]
  }
]

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
    d[3]
  ]
}

export { f as files, d as dirs, routes, tree }
