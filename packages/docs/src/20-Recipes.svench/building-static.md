<svench:options title="Building a static site" />

# Building static site

To build a static version of the svench pages, run:

```bash
pnpx svench build
```

If all goes well, the site will then be available in the directory `.svench/build`. You can upload it to your favorite CDN, or preview it locally. For example, with [sirv](https://www.npmjs.com/package/sirv-cli):

```bash
pnpx sirv-cli .svench/build
```
