import Vue from 'vue'
import App from './app.vue'
import VueResource from 'vue-resource'
import util from '../../util/util'
import log from '../../util/logger'
import '../../assets/icon/iconfont.css'
//引入vue-resource
Vue.use(VueResource)
//上线后不在显示警告信息
Vue.config.productionTip = false
//引入log工具
Vue.prototype.$logHelper = log
//引入工具，配置代理
Vue.prototype.$utilHelper = util

new Vue({
  el: '#app',
  render: h => h(App)
})
