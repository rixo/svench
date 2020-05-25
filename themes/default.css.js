(function () {
  'use strict';

  /* eslint-env browser */

  function styleInject(css, ref, id) {
    if (ref === undefined) ref = {};
    const { insertAt } = ref;

    document
      .querySelectorAll('[data-module="' + id + '"]')
      .forEach(element => element.remove());

    if (!css || typeof document === 'undefined') return

    const head = document.head || document.querySelector('head');
    const style = document.createElement('style');
    style.type = 'text/css';

    style.dataset.module = id;

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.append(style);
      }
    } else {
      head.append(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.append(document.createTextNode(css));
    }
  }

  var css_248z = "@import url(https://cdn.jsdelivr.net/gh/tonsky/FiraCode@2/distr/fira_code.css);\nh1.mdsvex {\n  font-size: 2em; }\n\nh2.mdsvex {\n  font-size: 1.66em; }\n\nh3.mdsvex {\n  font-size: 1.33em; }\n\nh4.mdsvex {\n  font-size: 1.25em;\n  font-weight: 300; }\n\nh5.mdsvex {\n  font-size: 1em;\n  font-weight: 500; }\n\nh6.mdsvex {\n  font-size: 1em;\n  font-weight: 300;\n  font-style: italic; }\n\nh1.mdsvex,\nh2.mdsvex,\nh3.mdsvex,\nh4.mdsvex,\nh5.mdsvex,\nh6.mdsvex {\n  margin-top: 1.33em; }\n  h1.mdsvex:first-child,\n  h2.mdsvex:first-child,\n  h3.mdsvex:first-child,\n  h4.mdsvex:first-child,\n  h5.mdsvex:first-child,\n  h6.mdsvex:first-child {\n    margin-top: 0; }\n\nh1.svench-content-md {\n  font-size: 2em; }\n\nh2.svench-content-md {\n  font-size: 1.66em; }\n\nh3.svench-content-md {\n  font-size: 1.33em; }\n\nh4.svench-content-md {\n  font-size: 1.33em;\n  font-weight: normal; }\n\nh5.svench-content-md {\n  font-size: 1em;\n  font-weight: bold; }\n\nh6.svench-content-md {\n  font-size: 1em;\n  font-weight: normal;\n  font-style: italic; }\n\n.svench-ui *,\n.svench-ui {\n  font-size: 16px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;\n  color: var(--text-primary); }\n\n/* https://colorpalettes.net/color-palette-4122/ */\n/* https://colorpalettes.net/color-palette-3548/ */\n.svench-app {\n  /* --light-1: rgba(141, 169, 196, 1);\n  --light-1-r: white;\n  --light-2: #6bc4a6;\n  --light-2-r: #20686c;\n\n  --primary: rgba(19, 64, 116, 0.8);\n  --primary-strong: rgba(19, 64, 116, 1);\n  --primary-r: var(--light-1);\n  --secondary: rgba(19, 49, 92, 1);\n  --secondary: #fe982a;\n  --secondary-r: #fff;\n  --tertiary: rgba(11, 37, 69, 1);\n  --tertiary-r: var(--light-1);\n\n  --gray: #aaa;\n  --gray-light: #eee; */\n  --white: white;\n  --text-primary: #666;\n  --light-1: rgba(141, 169, 196, 1);\n  --light-1-r: white;\n  --light-2: #e3e8ee;\n  --light-2-r: #79889a;\n  --primary: rgba(19, 64, 116, 0.8);\n  --primary-strong: rgba(19, 64, 116, 1);\n  --primary-r: var(--light-1);\n  --secondary: #bad5dc;\n  --secondary-r: #fff;\n  --secondary-light: #e4ecf1;\n  --tertiary: #b4b4af;\n  --tertiary-r: #e3e8ee;\n  --gray: #a5b4b9;\n  --gray-light: #e3e8ee;\n  --gray-dark: #79889a; }\n\n/* === Prism === */\ncode[class*='language-'],\n.svench-ui code[class*='language-'] * {\n  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; }\n\n/* === OverlayScrollbars === */\nbody\n.os-theme-dark\n> .os-scrollbar\n> .os-scrollbar-track\n> .os-scrollbar-handle {\n  /* border-radius: 0px; */\n  opacity: 0.2;\n  background-color: var(--primary); }\n\n/* .svench-canvas:not(.focus) > svench-component, */\n.svench-canvas:not(.focus) > .svench-render-box-body {\n  padding: 1.5em 1em; }\n\n/* .svench-canvas:not(.focus) svench-component {\n  padding-bottom: 2.5em;\n} */\nsvench-component:not(.focus) .svench-viewbox {\n  border-width: 1px; }\n";
  styleInject(css_248z, undefined, "trwrpc");
  if (undefined) undefined.accept();

}());
