import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter)

export const constantRoutes = [{path: '/', redirect: '/login', hidden: true},

    {
        path: '/login', name: 'Login', component: () => import('@/views/login')
    },

    {
        path: '/admin/bookManagement', name: 'BookManagement', component: () => import('@/views/admin/bookManagement')
    }, {
        path: '/admin/userManagement', name: 'UserManagement', component: () => import('@/views/admin/userManagement')
    },

    {
        path: '/user/bookLibrary', name: 'BookLibrary', component: () => import('@/views/user/bookLibrary')
    },
    {
        path: '/user/bookReader/:bookId',
        component: () => import('@/views/user/bookReader/index.vue'),
        name: 'BookReader',
        props: true
    }
]

const createRouter = () => new VueRouter({
    routes: constantRoutes, mode: 'history'
})

const router = createRouter()

export default router;
