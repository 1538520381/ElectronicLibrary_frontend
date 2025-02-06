import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter)

export const constantRoutes = [{path: '/', redirect: '/admin/login', hidden: true}, {
    path: '/admin/login', name: 'Login', component: () => import('@/views/admin/login')
}, {
    path: '/admin/bookManagement', name: 'BookManagement', component: () => import('@/views/admin/bookManagement')
}, {
    path: '/user/bookLibrary', name: 'BookLibrary', component: () => import('@/views/user/bookLibrary')
}]

const createRouter = () => new VueRouter({
    routes: constantRoutes, mode: 'history'
})

const router = createRouter()

export default router;
