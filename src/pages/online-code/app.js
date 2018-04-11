import Vue from 'vue'
import App from './app.vue'
import 'iview/dist/styles/iview.css'
import iView from 'iview'

Vue.use(iView)

new Vue({
  el: '#app',
  render: h => h(App)
})
