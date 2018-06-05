import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import routes from './router'
import VueResource from 'vue-resource'
// import util from './util/util'
// import log from './util/logger'

Vue.use(VueRouter)
Vue.use(VueResource)
const router = new VueRouter({
    routes
  })

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
