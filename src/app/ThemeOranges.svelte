<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/themes/prism.min.css"
    integrity="sha256-cuvic28gVvjQIo3Q4hnRpQSNB0aMw3C+kjkR0i+hrWg="
    crossorigin="anonymous" />

  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/plugins/toolbar/prism-toolbar.min.css"
    integrity="sha256-P45OhhEWm49G8sadt2n5rDaWLa3xZbDOQhJliuaojH0="
    crossorigin="anonymous" />
</svelte:head>

<slot />

<style>
  /* https://colorpalettes.net/color-palette-4122/ */
  /* https://colorpalettes.net/color-palette-3548/ */
  :global(.svench.svench) {
    /* --light-1: rgba(141, 169, 196, 1);
    --light-1-r: white;
    --light-2: #6bc4a6;
    --light-2-r: #20686c;

    --primary: rgba(19, 64, 116, 0.8);
    --primary-strong: rgba(19, 64, 116, 1);
    --primary-r: var(--light-1);
    --secondary: rgba(19, 49, 92, 1);
    --secondary: #fe982a;
    --secondary-r: #fff;
    --tertiary: rgba(11, 37, 69, 1);
    --tertiary-r: var(--light-1);

    --gray: #aaa;
    --gray-light: #eee; */

    --white: white;

    --light-1: rgba(141, 169, 196, 1);
    --light-1-r: white;
    --light-2: #e3e8ee;
    --light-2-r: #79889a;

    --primary: rgba(19, 64, 116, 0.8);
    --primary-strong: rgba(19, 64, 116, 1);
    --primary-r: var(--light-1);
    --secondary: #bad5dc;
    --secondary-r: #fff;
    --secondary-light: #e4ecf1;
    --tertiary: #b4b4af;
    --tertiary-r: #e3e8ee;

    --gray: #a5b4b9;
    --gray-light: #e3e8ee;
    --gray-dark: #79889a;
  }

  :global(h2, h3) {
    font-size: 1rem;
  }

  /* === Prism === */

  @import url(https://cdn.jsdelivr.net/gh/tonsky/FiraCode@2/distr/fira_code.css);

  :global(code[class*='language-']) {
    font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono',
      monospace;
    font-size: 0.9em;
  }

  /* === OverlayScrollbars === */

  :global(body
      .os-theme-dark
      > .os-scrollbar
      > .os-scrollbar-track
      > .os-scrollbar-handle) {
    /* border-radius: 0px; */
    opacity: 0.2;
    background-color: var(--primary);
  }
</style>
