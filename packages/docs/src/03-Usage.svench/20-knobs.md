<script>
   import { View } from 'svench';
</script>

<svench:options title="Knobs" />

# Knobs

Knobs are used to interact with the View components.

## Defining and using knobs

Knobs are defined for a `View` via the `knobs` prop, and their current values
are retrieved via `let:knobs`.

```svelte
<View name="defining and using a knob, simple" knobs={{ someProp: "my default value" }} let:knobs>

    <p>someProp: {knobs.someProp}</p>

</View>

<!-- equivalent, using deconstructors -->

<View name="defining and using a knob, using deconstructor" 
      knobs={{ someProp: "my default value" }} 
      let:knobs={{someProp}}>

    <p>someProp: {someProp}</p>

</View>
```

<View name="defining and using a knob, simple" knobs={{ someProp: "my default value" }} let:knobs>

    <p>someProp: {knobs.someProp}</p>

</View>

<View name="defining and using a knob, using deconstructor" knobs={{ someProp: "my default value" }} let:knobs={{someProp}}>

    <p>someProp: {someProp}</p>

</View>

## Knobs passed as plain objects

Knobs can be passed to the views as an object, where the keys are the knob
names and the values are their defaultvalues:

```svelte
<View name="knobs as objects" 
      knobs={{ firstProp: "hello world", secondProp: 123 }} 
      let:knobs={{firstProp, secondProp}}>

    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>

</View>
```

<View name="knobs as objects" knobs={{ firstProp: "hello world", secondProp: 123 }} let:knobs={{firstProp, secondProp}}>

    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>

</View>

## Knobs passed as an array

Knobs can also be passed an array of knob definition. The props for the
different types are shown in the table below.


| type      | props                           |
|-----------|---------------------------------|
| text      | `name`, `default`               |
| number    | `name`, `default`               |
| range     | `name`, `default`, `min`, `max` |
| bool      | `name`, `default`               |


```svelte
<View name="knobs as array" knobs={
    [ { name: 'firstProp', type: 'text', default: 'Hello world'}, 
      {name: 'secondProp', type: 'number', default: 123} ]
    }  
    let:knobs={{firstProp, secondProp}}>

    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>

</View>
```

<View name="knobs as array" knobs={
    [ { name: 'firstProp', type: 'text', default: 'Hello world'}, 
      {name: 'secondProp', type: 'number', default: 123} ]
    }  
    let:knobs={{firstProp, secondProp}}>

    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>

</View>
