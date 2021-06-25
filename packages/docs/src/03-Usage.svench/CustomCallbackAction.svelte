<script>
  export let onAction = () => {}
</script>

<button on:click={() => onAction('doing the thing')}>
  trigger custom callback
</button>
