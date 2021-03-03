<script>
  import { fly, fade } from 'svelte/transition'

  export let search

  let input

  const close = () => {
    $search.open = false
  }

  const selectInput = () => {
    input.select()
  }

  $: ({ open } = $search)

  $: if (open && input) selectInput()
</script>

{#if $search.open}
  <div
    class="svench-ui svench-search-result--overlay"
    transition:fade={{ duration: 100 }}
    on:click={close} />

  <dialog
    transition:fly={{ y: 16, duration: 100 }}
    class="svench-ui svench-search-result--dialog"
    open>
    <input
      bind:this={input}
      class="svench-search-result--input"
      type="search"
      autofocus
      placeholder="Searchin'"
      bind:value={$search.query} />
    <div class="svench-search-result--results">
      {#each $search.results as { index, selected, href, searchKey, title, path } (href)}
        <a
          class:selected
          {href}
          on:click={close}
          on:mouseenter={() => $search.setSelectedIndex(index)}>
          <strong class="svench-search-result--item-title">
            {@html title}
          </strong>
          <em class="svench-search-result--item-path">
            {@html path}
          </em>
        </a>
      {:else}
        <p>No results</p>
      {/each}
    </div>
  </dialog>
{/if}

<style>
  .svench-search-result--overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: hsla(209deg, 20%, 66%, 0.75);
  }

  .svench-search-result--dialog {
    position: fixed;
    top: calc(var(--toolbar-height) + 2rem);
    left: 0;
    margin: auto;
    width: 100%;
    max-width: 40rem;
    border: 0;
    border-radius: 0.5rem;
    box-shadow: 0 8px 12px hsla(0deg, 0%, 0%, 0.1),
      0 4px 4px hsla(0deg, 0%, 0%, 0.2);
  }

  .svench-search-result--input {
    width: 100%;
    font-size: 2rem;
    border: 0;
    border-bottom: 1px solid var(--gray-light);
  }
  .svench-search-result--input:focus {
    outline: none;
  }
  .svench-search-result--input::placeholder {
    color: var(--gray-light);
  }

  .svench-search-result--results {
    margin-top: 1rem;
  }
  .svench-search-result--results > a {
    text-decoration: none;
    display: block;
    padding: 0.33rem 0.66rem;
    border-bottom: 2px solid var(--white);
    background: var(--secondary-light);
  }
  .svench-search-result--results > a :global(*) {
    color: var(--text-primary);
  }
  .svench-search-result--results > a.selected {
    background: var(--tertiary);
  }
  .svench-search-result--results > a.selected,
  .svench-search-result--results > a.selected :global(*) {
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
  .svench-search-result--results :global(b) {
    font-weight: bold;
    opacity: 1;
  }
</style>
