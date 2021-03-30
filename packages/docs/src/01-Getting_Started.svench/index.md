<script>
  import { View } from 'svench'
  import Counter from './Counter.svelte'
</script>

# Getting Started

<View
  name="foo"
  let:action
  knobs={{color: 'black', bold: false}}
  let:knobs={{color, bold}}>
  <Counter {color} {bold} onChange={action('onChange')} />
</View>
