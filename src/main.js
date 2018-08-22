// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'

// import VueResource from 'vue-resource'
import util from './util/util'
import log from './util/logger'
import ax from './lib/axios'

import './assets/icon/iconfont.css'
import VueSession from 'vue-session'

import config from './util/config';

Vue.use(MuseUI)
//  引入vue-resource
// Vue.use(VueResource)
//  上线后不在显示警告信息
Vue.config.productionTip = false
//  引入log工具
Vue.prototype.$logHelper = log
//  引入工具，配置代理
Vue.prototype.$utilHelper = util
//  引入axios作为http
Vue.prototype.$http = ax;
// 引入全局变量
Vue.prototype.$common = config
// 引入session
Vue.use(VueSession);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
