<script>
  import { fly, fade } from 'svelte/transition'
  import overlayscrollbars from './overlayscrollbars-action.js'

  export let search

  let input
  let overlay
  let scroller
  const itemElements = []

  const close = () => {
    $search.open = false
  }

  const handleOverlayClick = ({ target }) => {
    if (target === overlay) close()
  }

  let mouseHasMoved = false

  let mouseX, mouseY

  const handleMouseMove = ({ clientX, clientY }) => {
    if (!open) return
    if (mouseX === clientX && mouseY === clientY) return
    mouseX = clientX
    mouseY = clientY
    mouseHasMoved = true
  }

  const trackMouse = open => {
    if (open) {
      if (mouseHasMoved) return
      mouseHasMoved = false
    } else {
      mouseHasMoved = false
    }
  }

  const handleHover = index => () => {
    if (!mouseHasMoved) return
    $search.setSelectedIndex(index, true)
    mouseHasMoved = false
  }

  const selectInput = () => {
    input.select()
  }

  $: ({ open, selectedIndex, preventScroll } = $search)

  $: if (open && input) selectInput()

  $: trackMouse(open)

  $: if (!preventScroll && itemElements[selectedIndex]) {
    const el = itemElements[selectedIndex]
    const viewport = scroller.querySelector('.os-viewport')
    if (viewport) {
      const itemRect = el.getBoundingClientRect()
      const viewportRect = viewport.getBoundingClientRect()
      if (itemRect.top < viewportRect.top) {
        viewport.scroll(0, el.offsetTop)
      } else if (itemRect.bottom > viewportRect.bottom) {
        viewport.scrollTo(
          0,
          el.offsetTop - viewport.offsetHeight + el.offsetHeight
        )
      }
    }
  }
</script>

<svelte:body on:mousemove={handleMouseMove} />

{#if $search.open}
  <div class="svench-ui svench-search-result">
    <div
      bind:this={overlay}
      class="svench-search-result--overlay"
      transition:fade={{ duration: 100 }}
      on:click={handleOverlayClick} />
    <div
      transition:fly={{ y: 16, duration: 100 }}
      class="svench-ui svench-search-result--dialog">
      <input
        bind:this={input}
        class="svench-search-result--input"
        type="search"
        placeholder="Searchin' Box"
        bind:value={$search.query} />
      <div bind:this={scroller} use:overlayscrollbars>
        <div class="svench-search-result--results">
          {#each $search.results as { selected, href, searchKey, title, path }, index (href)}
            <a
              bind:this={itemElements[index]}
              class:selected
              {href}
              on:click={close}
              on:mousemove={handleHover(index)}>
              <strong class="svench-search-result--item-title">
                {@html title}
              </strong>
              <em class="svench-search-result--item-path">
                {@html path}
              </em>
            </a>
          {:else}
            <p class="svench-search-result--results--no-results">No results</p>
          {/each}
          {#if $search.hasMore}
            <div class="svench-search-result--results--has-more">&hellip;</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .svench-search-result {
    --padding: 0.75rem;
    position: fixed;
    top: 10vh;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: start;
  }
  .svench-search-result :global(.os-host) {
    max-height: 70vh;
  }

  .svench-search-result--overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: hsla(209deg, 20%, 66%, 0.75);

    display: flex;
    justify-content: center;
    align-items: start;

    /* above menu overlay */
    z-index: 3;
  }

  .svench-search-result--dialog {
    position: relative;
    z-index: 3;
    background-color: var(--white);
    padding: var(--padding);
    width: 100%;
    max-width: 40rem;
    overflow: hidden;
    border: 0;
    border-radius: 0.5rem;
    box-shadow: 0 8px 12px hsla(0deg, 0%, 0%, 0.1),
      0 4px 4px hsla(0deg, 0%, 0%, 0.2);
  }

  @media only screen and (max-width: 800px) {
    .svench-search-result--dialog {
      box-sizing: border-box;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      width: 100%;
      min-width: none;
      max-width: none;
      max-height: none;
      margin: 0;
      border-radius: 0;
      border: 0;
      display: flex;
      flex-direction: column;
    }
    .svench-search-result--results {
      flex: 1;
    }
  }

  .svench-search-result--input {
    width: 100%;
    font-size: 2rem;
    border: 0;
    border-bottom: 1px solid var(--gray-light);
    background: none;
  }
  .svench-search-result--input:focus {
    outline: none;
  }
  .svench-search-result--input::placeholder {
    color: var(--gray-light);
  }

  .svench-search-result--results {
    flex: 1;
    overflow: auto;
    line-height: 1.5;
    margin-top: var(--padding);
  }
  .svench-search-result--results a {
    text-decoration: none;
    display: block;
    padding: 0.33rem 0.66rem;
    border-bottom: 2px solid var(--white);
    background: var(--secondary-light);
    outline: none;
  }
  .svench-search-result--results a :global(*) {
    color: var(--text-primary);
  }
  .svench-search-result--results a.selected {
    background: var(--tertiary);
  }
  .svench-search-result--results a.selected,
  .svench-search-result--results a.selected :global(*) {
    color: var(--white);
  }
  .svench-search-result--results strong {
    display: block;
    font-weight: normal;
  }
  .svench-search-result--results em {
    display: block;
  }
  .svench-search-result--results em,
  .svench-search-result--results em :global(*) {
    font-size: 0.8rem;
    color: var(--text-primary);
    opacity: 0.8;
    font-style: normal;
    font-weight: normal;
  }
  .svench-search-result--results em :global(b),
  .svench-search-result--results :global(b) {
    font-weight: bold;
    opacity: 1;
  }

  .svench-search-result--results--has-more {
    text-align: center;
    font-size: 1.5rem;
  }

  .svench-search-result--results--no-results {
    text-align: center;
    color: var(--gray);
  }
</style>
