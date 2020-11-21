<script>
  let cls
  export { cls as class }

  export let isDirectory = false
  export let isIndex = false
  export let hasChildren = false
  export let hasViews = false
</script>

{#if isDirectory}
  {#if isIndex}
    {#if hasChildren || hasViews}
      <!-- 🞛 -->
      <svg
        class={cls}
        width="1563"
        height="1568"
        version="1.1"
        viewBox="0 -492 1563 1568"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:cc="http://creativecommons.org/ns#"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <metadata>
          <rdf:RDF>
            <cc:Work rdf:about="">
              <dc:format>image/svg+xml</dc:format>
              <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
              <dc:title />
            </cc:Work>
          </rdf:RDF>
        </metadata>
        <g transform="matrix(1,0,0,-1,-6,824)">
          <path
            d="m318 532 469 471 469-471-469-471zm-160 0 629-632 630 632-630
            632zm-152 0 781 784 782-784-782-784z"
            fill="currentColor" />
        </g>
      </svg>
    {:else}
      <!-- ◇ -->
      <svg
        class={cls}
        width="1563"
        height="1568"
        version="1.1"
        viewBox="0 -492 1563 1568"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:cc="http://creativecommons.org/ns#"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <metadata>
          <rdf:RDF>
            <cc:Work rdf:about="">
              <dc:format>image/svg+xml</dc:format>
              <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
              <dc:title />
            </cc:Work>
          </rdf:RDF>
        </metadata>
        <g transform="matrix(1,0,0,-1,-6,824)">
          <path
            d="m158 532 629-632 630 632-630 632zm-152 0 781 784 782-784-782-784z"
            fill="currentColor" />
        </g>
      </svg>
    {/if}
  {:else if hasChildren}
    <!-- ▶ -->
    <svg
      class={cls}
      version="1.1"
      viewBox="0 0 1568 1568"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <metadata>
        <rdf:RDF>
          <cc:Work rdf:about="">
            <dc:format>image/svg+xml</dc:format>
            <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
            <dc:title />
          </cc:Work>
        </rdf:RDF>
      </metadata>
      <g transform="matrix(.54516 0 0 -1 402.73 1316)">
        <path d="m6-252v1568l1563-784z" fill="currentColor" />
      </g>
    </svg>
  {:else}▪{/if}
{:else if hasChildren}
  <!-- 🞛 -->
  <svg
    class={cls}
    width="1563"
    height="1568"
    version="1.1"
    viewBox="0 -492 1563 1568"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <metadata>
      <rdf:RDF>
        <cc:Work rdf:about="">
          <dc:format>image/svg+xml</dc:format>
          <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
          <dc:title />
        </cc:Work>
      </rdf:RDF>
    </metadata>
    <g transform="matrix(1,0,0,-1,-6,824)">
      <path
        d="m318 532 469 471 469-471-469-471zm-160 0 629-632 630 632-630
        632zm-152 0 781 784 782-784-782-784z"
        fill="currentColor" />
    </g>
  </svg>
{:else if hasViews}
  <!-- ❖ -->
  <svg
    class={cls}
    width="1496"
    height="1496"
    version="1.1"
    viewBox="0 -492 1496 1496"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <metadata>
      <rdf:RDF>
        <cc:Work rdf:about="">
          <dc:format>image/svg+xml</dc:format>
          <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
          <dc:title />
        </cc:Work>
      </rdf:RDF>
    </metadata>
    <g transform="matrix(1,0,0,-1,-170,999)">
      <path
        d="m170 745 339 339 339-339-339-339zm818 0 340 338 338-338-338-341zm-407
        405 339 341 339-341-339-338zm0-816 339 339 339-339-339-339z"
        fill="currentColor" />
    </g>
  </svg>
{:else}
  <!-- ◇ -->
  <svg
    class={cls}
    width="1563"
    height="1568"
    version="1.1"
    viewBox="0 -492 1563 1568"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <metadata>
      <rdf:RDF>
        <cc:Work rdf:about="">
          <dc:format>image/svg+xml</dc:format>
          <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
          <dc:title />
        </cc:Work>
      </rdf:RDF>
    </metadata>
    <g transform="matrix(1,0,0,-1,-6,824)">
      <path
        d="m158 532 629-632 630 632-630 632zm-152 0 781 784 782-784-782-784z"
        fill="currentColor" />
    </g>
  </svg>
{/if}
