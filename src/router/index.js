import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/page/home/home.vue';
import Editor from '@/page/editor/editor.vue';
import Login from '@/page/login/login.vue';
import Register from '@/page/register/register.vue';
import ProfileIndex from '@/page/profile/index.vue';
import ProfileMy from '@/page/profile/profile.vue';
import ProfileProject from '@/page/profile/project.vue';
import Project from '@/page/project/index.vue';
import ProjectAdd from '@/page/project/newProject.vue';

Vue.use(Router);

let router = new Router({
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
      component: Editor,
      meta: { requireAuth: true }
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
      component: ProfileIndex,
      meta: { requireAuth: true },
      children: [
        {
          path: 'my',
          name: 'Profile_my',
          component: ProfileMy,
          meta: { requireAuth: true }
        },
        {
          path: 'project',
          name: 'Profile_project',
          component: ProfileProject,
          meta: { requireAuth: true }
        }
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
          component: ProjectAdd,
          meta: { requireAuth: true }
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    let logged = !!Vue.cookie.get('jwt');
    if (logged) {
      next();
    } else {
      next({ path: '/login' });
    }
  } else {
    next();
  }
});

export default router;
