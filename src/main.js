// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import VueCookie from 'vue-cookie';

import router from './router';
// import Vuex from 'vuex';
import store from './store/index';

import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

// import VueResource from 'vue-resource'
import util from './util/util';
import log from './util/logger';
import ax from './lib/axios';

import './assets/icon/iconfont.css';

import VueJWT from 'vuejs-jwt';
// Tell Vue to use the plugin

// Font-awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import VuejsDialog from 'vuejs-dialog';
// import VuejsDialogMixin from 'vuejs-dialog/vuejs-dialog-mixin.min.js'; // only needed in custom components

// include the default style
import 'vuejs-dialog/dist/vuejs-dialog.min.css';

import config from './util/config';
Vue.use(VueCookie);

// Vue.use(Vuex);

Vue.use(VueJWT, {
  signKey: 'go-online',
  storage: 'cookie'
});

// Tell Vue to install the plugin.
Vue.use(VuejsDialog, {
  html: true,
  okText: '确定',
  cancelText: '取消',
  animation: 'fade'
});

library.add(faPlus);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.use(MuseUI);
//  引入vue-resource
// Vue.use(VueResource)
//  上线后不在显示警告信息
Vue.config.productionTip = false;
//  引入log工具
Vue.prototype.$logHelper = log;
//  引入工具，配置代理
Vue.prototype.$utilHelper = util;
//  引入axios作为http
Vue.prototype.$http = ax;
// 引入全局变量
Vue.prototype.$common = config;

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
