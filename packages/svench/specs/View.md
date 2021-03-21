```html
<script>
  import { View } from 'svench'

  export const beforeEach = async () => {}
</script>

<View {init} />

<!-- inline init -->
<View init={() => {
  const name = fake.name()
  const age = fake.randomNumer(0, 77)
  return { name, age }
}} let:data={{name, age}}>
  <Cmp {name} {age} />
</View>

<View {init} let:data={{name, age}}>
  <Cmp {name} {age} />
</View>
```
