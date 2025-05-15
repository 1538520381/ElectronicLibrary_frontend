import Vue from "vue";
import VueRouter from "vue-router";

import Login from '@/views/login/index.vue'
import BookManagement from "@/views/admin/bookManagement/index.vue";
import UserManagement from "@/views/admin/userManagement/index.vue";
import BookLibrary from "@/views/user/bookLibrary/index.vue";
import BookReader from "@/views/user/bookReader/index.vue"

Vue.use(VueRouter)

export const constantRoutes = [{path: '/', redirect: '/login', hidden: true},

    {
        path: '/login', name: 'Login', component: Login,
    },

    {
        path: '/admin/bookManagement', name: 'BookManagement', component: BookManagement
    }, {
        path: '/admin/userManagement', name: 'UserManagement', component: UserManagement
    },

    {
        path: '/user/bookLibrary', name: 'BookLibrary', component: BookLibrary
    }, {
        path: '/user/bookReader/:bookId', component: BookReader, name: 'BookReader', props: true
    }]

const createRouter = () => new VueRouter({
    routes: constantRoutes, mode: 'history'
})

const router = createRouter()

export default router;
