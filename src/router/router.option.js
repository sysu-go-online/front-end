

const home = r => require.ensure([], () => r(require('pages/home/app.vue')), 'user');
const OnlineCode = r => require.ensure([], () => r(require('pages/online-code/app.vue')), 'user');


module.exports = {
  mode: 'history',
  routes: [{
    name: 'Home',
    path: '/home',
    component: home
  },{
    name: 'online-code',
    path: '/online-code/app.vue',
    component: OnlineCode
  }]
};
