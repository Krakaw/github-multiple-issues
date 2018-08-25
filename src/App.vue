<template>
  <md-app id="app" class="md-app">
    <md-app-content>
      <Issues />
      <span class="version">{{version}}</span>
    </md-app-content>

  </md-app>
</template>

<script>
import Issues from "./components/Issues.vue";
import { version } from "../package.json";
export default {
  name: "app",
  components: {
    Issues
  },
  computed: {
    version() {
      return version;
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.version {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
