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

  let actionsEnabled = false

  $: tabs = Object.fromEntries(
    names
      .map(x => {
        if (x === 'actions' && !actionsEnabled) return false
        return extras[x] && titles[x] && [x, titles[x]]
      })
      .filter(Boolean)
  )

  $: activeTab =
    activeTab == null || !tabs[activeTab] ? Object.keys(tabs)[0] : activeTab

  $: ({ actions } = extras)

  // $: autoShowActions = $actions && $actions.autoShow
  $: ({ autoShow: autoShowActions } = $actions || {})

  const showActions = () => {
    activeTab = 'actions'
  }

  const disableActions = () => {
    // setTimeout to break circular dep with actionsVisible (otherwise this
    // reactive block doesn't run -- bug in Svelte probably)
    setTimeout(() => {
      actionsEnabled = false
    })
  }

  const enableActions = () => {
    // setTimeout to break circular dep with actionsVisible (otherwise this
    // reactive block doesn't run -- bug in Svelte probably)
    setTimeout(() => {
      actionsEnabled = true
      // NOTE when not $actions.enabled, this means we show because of new event
      if (!$actions.enabled) {
        showActions()
      }
    })
  }

  let lastActionsCount = 0

  const maybeAutoShowActions = $actions => {
    if (!$actions) return
    if ($actions.events.length > lastActionsCount) {
      showActions()
    }
    lastActionsCount = $actions.events.length
  }

  $: if (
    !actionsEnabled &&
    $actions &&
    ($actions.enabled || $actions.events.length === 1)
  ) {
    enableActions()
  }
  $: if (actionsEnabled && (!$actions || $actions.enabled === false)) {
    disableActions()
  }

  $: if (autoShowActions) maybeAutoShowActions($actions)

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
