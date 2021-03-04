<script>
  export let search

  // TODO this should probably live in a more central place (the store?)
  const handleKeydown = e => {
    switch (e.key) {
      case 'Escape':
        if (!$search.open) return
        $search.open = false
        break

      case 'Enter':
        if (!$search.open) return
        if ($search.results.length === 0) return
        $search.select()
        break

      case 'o':
      case 'O':
        if (!e.ctrlKey) return
        $search.open = !$search.open
        break

      case 'K':
      case 'k':
        if (!e.ctrlKey) return
        $search.selectUp()
        break

      case 'ArrowUp':
        $search.selectUp()
        break

      case 'j':
      case 'J':
        if (!e.ctrlKey) return
      case 'ArrowDown':
        $search.selectDown()
        break

      case 'h':
      case 'H':
        if (!e.ctrlKey) return
        $search.query = ''
        break

      default:
        return
    }
    e.preventDefault()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="svench-omnisearch-ct">
  <button on:click={() => ($search.open = true)}>
    <span class="svench-omnisearch-button-label">Search</span>
    <kbd>Ctrl</kbd><kbd>O</kbd></button>
</div>

<style>
  .svench-omnisearch-ct {
    --padding: 0.5rem;
  }

  .svench-omnisearch-ct {
    height: var(--toolbar-height);
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    margin-left: var(--padding);
    width: calc(100% - var(--padding) * 2);
  }

  button {
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    border: 0;
    background-color: var(--light-2-r);
    width: 100%;
    min-width: 11rem;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    opacity: .9;
    transition: opacity 150ms;
    box-shadow: inset 2px 2px 6px hsla(0, 0%, 0%, .2);
  }

  button:hover {
    opacity: 1;
  }

  button .svench-omnisearch-button-label {
    color: var(--light-2);
    margin-right: 0.5rem;
  }

  kbd {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    font: 0.8rem SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    line-height: 1;
    color: #444d56;
    vertical-align: middle;
    background-color: #fafbfc;
    border: 1px solid #d1d5da;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #d1d5da;
    margin: 0 0.1rem;
    position: relative;
  }
</style>
