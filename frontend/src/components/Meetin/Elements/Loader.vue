
<template>
  <div class="lds-roller" v-bind:style="`width:${width} px;height:${height} px`">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
export default {
  props:{
    width: 80,
    height: 80
  }
}
</script>

<style scoped>

</style>