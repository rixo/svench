<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const doIt = () =>
    dispatch('customEvent', {
      payload: 'blah blah',
    })
</script>

<button on:click={doIt}>trigger custom event</button>
