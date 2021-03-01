<script>
  export let search

  let input

  const handleSubmit = () => {
    console.trace($search)
  }

  const handleKeydown = e => {
    if (!input) return
    if (!e.ctrlKey) return
    if (!['k', 'K'].includes(e.key)) return
    e.preventDefault()
    input.focus()
  }

  // onMount(() => {
  //
  //   window.addEventListener('keydown', handleKeydown)
  //
  //   return () => {
  //     window.removeEventListener('keydown', handleKeydown)
  //   }
  // })
</script>

<svelte:window on:keydown={handleKeydown} />

<form on:submit|preventDefault={handleSubmit}>
  <input bind:this={input} type="search" placeholder="Search Ctrl+K" bind:value={$search.query} />
</form>

<style>
  form {
    --padding: 4px;
    --padding: 0px;
  }

  form {
    height: var(--toolbar-height);
    width: 100%;
    position: relative;
  }

  input {
    position: absolute;
    top: var(--padding);
    bottom: var(--padding);
    left: var(--padding);
    right: var(--padding);
    width: calc(100% - var(--padding) * 2);
  }
  input {
    padding: .25em .75em;
    border: 0;
    border-right: 1px solid var(--gray-light);
    border-bottom: 1px solid var(--gray-light);
  }
  input::placeholder {
    color: var(--tertiary-light);
  }
</style>
