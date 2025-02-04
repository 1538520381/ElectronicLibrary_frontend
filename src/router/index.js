import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter)

export const constantRoutes = [{path: '/', redirect: '/bookManagement', hidden: true}, {
    path: '/bookManagement', name: 'BookManagement', component: () => import('@/views/admin/bookManagement')
}]

const createRouter = () => new VueRouter({
    routes: constantRoutes, mode: 'history'
})

const router = createRouter()

export default router;
