import VueRouter from 'vue-router'

import editor from '../pages/online-code/app'

const routers = [
    {path: "/editor", component: editor}
]

const router = new VueRouter({
    routes
})

export default router