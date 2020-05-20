<script>
  import ExtraSource from './ExtraSource.svelte'
  import ExtraKnobs from './ExtraKnobs.svelte'
  import ExtraActions from './ExtraActions.svelte'

  export let extras

  const titles = {
    knobs: 'Knobs',
    actions: 'Actions',
    source: 'Source',
    // test: 'Test',
  }

  const names = ['source', 'knobs', 'actions']

  let actionsVisible = false

  $: tabs = Object.fromEntries(
    names
      .map(x => {
        if (x === 'actions' && !actionsVisible) return false
        return extras[x] && titles[x] && [x, titles[x]]
      })
      .filter(Boolean)
  )

  $: activeTab =
    activeTab == null || !tabs[activeTab] ? Object.keys(tabs)[0] : activeTab

  $: ({ actions } = extras)

  $: if (!actionsVisible && $actions && $actions.events.length === 1) {
    actionsVisible = true
    activeTab = 'actions'
  }

  $: hasExtras = Object.keys(tabs).length > 0
</script>

{#if hasExtras}
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

  <div class="content">
    {#if activeTab === 'source'}
      <ExtraSource code={extras.source} />
    {:else if activeTab === 'actions'}
      <ExtraActions actions={$actions} />
    {:else if activeTab === 'knobs'}
      <ExtraKnobs knobs={extras.knobs} />
    {/if}
  </div>
{/if}

<style>
  .tabs {
    display: flex;
  }

  .tabs button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin: 0;
    padding: 0.5em 1.5em;
    transition: 0.3s;
    border-bottom: 3px solid transparent;
    /* FIXME anyway to make this accessible? */
    outline: none;
  }

  .tabs button.active {
    border-color: var(--secondary);
  }

  .content {
    flex: 1;
    overflow: auto;
    background-color: #f5f2f0;
  }
</style>
