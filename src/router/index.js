import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/page/home/home.vue';
import Editor from '@/page/editor/editor.vue'
import Login from '@/page/login/login.vue'
import Register from '@/page/register/register.vue'
import Profile_index from '@/page/profile/index.vue'
import Profile_my from '@/page/profile/profile.vue'
import Profile_project from '@/page/profile/project.vue'
import Project from '@/page/project/index.vue'
import Project_add from '@/page/project/newProject.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/editor/:projectname',
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
      ]
    },
    {
      path: '/project',
      name: 'Project',
      component: Project,
      children: [
        {
          path: 'add',
          name: 'Project_add',
          component: Project_add,
        },
      ]
    }
  ]
})
