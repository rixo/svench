<script>
  import { setContext } from './util'

  export let view

  setContext({ render: view })
</script>

<slot />
