<script>
  import ExtraSource from './ExtraSource.svelte'

  export let extras

  const tabs = {
    source: 'Source',
    // knobs: 'Knobs',
    // test: 'Test',
  }

  let activeTab = Object.keys(tabs)[0]
</script>

{#if extras.source}
  <div class="tabs">
    {#each Object.entries(tabs) as [id, name] (id)}
      <button
        class:active={id === activeTab}
        on:click={() => {
          activeTab = id
        }}>
        {name}
      </button>
    {/each}
  </div>

  {#if activeTab === 'source'}
    <div class="content">
      <ExtraSource code={extras.source} />
    </div>
  {/if}
{/if}

<style>
  .tabs {
    display: flex;
  }

  .tabs button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5em 1.5em;
    transition: 0.3s;
    border-bottom: 3px solid transparent;
  }

  .tabs button.active {
    border-color: var(--secondary);
  }

  .content {
    flex: 1;
    overflow: auto;
  }
</style>
