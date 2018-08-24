<template>
  <div id="app" class="md-app">
    <Issues msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Issues from './components/Issues.vue'

export default {
  name: 'app',
  components: {
    Issues
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
