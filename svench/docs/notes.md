# Notes

`rollup-plugin-svelte` is added as dev dep for linked projects to work with svenchify / proxyquire.

## URLs

Files in root of `src` (Svench dir) map to URL prefixed with `/_/` (default section). For other URLs, the first segment is the section.

Directory index have the same path as the directory (without `/index`).

`/index` suffix necessarilly indicates a _component index_ (making the distinction between components and dirs all the more blurry ~~).

```
/             => /index.svench (home)
/_/Foo        => /Foo.svench

/:section/Cmp => /section.svench/Cmp.svench
              => /section/Cmp.svench

/:section     => /section[.svench]/index.svench
              => /section.svench
              => /section.index.svench
```
