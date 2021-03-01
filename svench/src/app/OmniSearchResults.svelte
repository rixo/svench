<script>
  import { fade } from 'svelte/transition'
</script>

<div class="svench-ui" transition:fade={{ duration: 150 }}>
  <h1>Searchin'?</h1>
</div>

<style>
  div {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    /* display: flex;
    justify-content: center;
    align-items: start; */

    background: var(--white);
    font-size: 2em;
    /* padding: .5em 1em; */
  }

  h1 {
    height: var(--toolbar-height);
    box-sizing: border-box;
    font-size: 1.5rem;
    font-weight: normal;
    border-bottom: 1px solid var(--gray-light);
    margin-top: 0;
    /* padding: .2em 2em; */
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
