import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css' // This line here

Vue.use(VueMaterial)
import VueResource from 'vue-resource';

Vue.use(VueResource);
new Vue({
  render: h => h(App)
}).$mount('#app')
