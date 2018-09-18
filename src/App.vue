<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
  }
};
</script>

<style>
html, body{
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #385c80;
  height: 100%;
  width: 100%;
}
.f-right {
  float: right;
}
.dg-content-body {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}
</style>
