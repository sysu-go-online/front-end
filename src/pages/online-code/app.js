import Vue from 'vue'
import App from './app.vue'
import VueResource from 'vue-resource'
import iView from 'iview'
import util from '../../util/util'
import log from '../../util/logger'
import 'element-ui/lib/theme-chalk/index.css'
import 'iview/dist/styles/iview.css'
import '../../assets/icon/iconfont.css'
//引用iview
Vue.use(iView)
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
