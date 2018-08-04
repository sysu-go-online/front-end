import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/page/editor/editor.vue'
import Login from '@/page/login/login.vue'
import Register from '@/page/register/register.vue'
import Profile_index from '@/page/profile/index.vue'
import Profile_my from '@/page/profile/profile.vue'
import Profile_project from '@/page/profile/project.vue'
import Profile_add_project from '@/page/profile/newProject.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/editor',
      name: 'Editor',
      component: Editor
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile_index,
      children: [
        {
          path: 'my',
          name: 'Profile_my',
          component: Profile_my,
        },
        {
          path: 'project',
          name: 'Profile_project',
          component: Profile_project,
        },
        {
          path: 'add',
          name: 'Profile_add_project',
          component: Profile_add_project,
        },
      ]
    }
  ]
})
