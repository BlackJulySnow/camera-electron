import { createRouter, createWebHashHistory } from 'vue-router'
import VideoView from '@/views/video/VideoView.vue';
import UserLoginView from '@/views/user/UserLoginView.vue';
import UserRegisterView from '@/views/user/UserRegisterView.vue';
import UserManagementView from '@/views/admin/UserManagementView.vue'
import CameraManagementView from '@/views/admin/CameraManagementView.vue'
import LicenseManagementView from '@/views/admin/LicenseManagementView.vue'
import StationManagementView from '@/views/admin/StationManagementView.vue'
import GoodsManagementView from '@/views/admin/GoodsManagementView.vue'
import VideoManagementView from '@/views/admin/VideoManagementView.vue'
import GroupManagementView from '@/views/admin/GroupManagementView.vue'
import TestView from '@/views/home/HomeView.vue'

import store from '@/store'

const routes = [{
        path: '/',
        name: "home",
        redirect: "/admin/goods",
        meta: {
            requestAuth: true,
            title: "订单管理",
        }
    },
    {
        path: "/video/:time/:id",
        name: "video_view",
        component: VideoView,
        meta: {
            requestAuth: false,
            title: "视频预览",
        }
    },
    {
        path: '/user/login/',
        name: "user_login",
        component: UserLoginView,
        meta: {
            requestAuth: false,
            title: "安全登录",
        }
    },
    {
        path: '/user/register/',
        name: "user_register",
        component: UserRegisterView,
        meta: {
            requestAuth: false,
            title: "安全注册",
        }
    },
    {
        path: '/admin/user/',
        name: "admin_user_management",
        component: UserManagementView,
        meta: {
            requestAuth: true,
            title: "用户管理",
        }
    },
    {
        path: '/admin/camera/',
        name: "admin_camera_management",
        component: CameraManagementView,
        meta: {
            requestAuth: true,
            title: "录像机管理",
        }
    },
    {
        path: '/admin/license',
        name: 'admin_license_management',
        component: LicenseManagementView,
        meta: {
            requestAuth: true,
            title: "授权管理",
        }
    },
    {
        path: '/admin/station',
        name: 'admin_station_management',
        component: StationManagementView,
        meta: {
            requestAuth: true,
            title: "工位管理",
        }
    },
    {
        path: '/admin/goods',
        name: 'admin_goods_management',
        component: GoodsManagementView,
        meta: {
            requestAuth: true,
            title: "订单管理",
        }
    },
    {
        path: '/admin/video',
        name: 'admin_video_management',
        component: VideoManagementView,
        meta: {
            requestAuth: true,
            title: "视频管理",
        }
    },
    {
        path: '/admin/group',
        name: 'admin_group_management',
        component: GroupManagementView,
        mata: {
            requestAuth: true,
            title: "组别管理",
        }
    },
    {
        path: '/test',
        name: 'test',
        component: TestView,
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    console.log(to.params, to.path);
    if (to.name != "user_login") {
        store.commit("updateFromPage", to.path);
    }
    if (to.meta.title) {
        document.title = to.meta.title
    }
    if (to.meta.requestAuth && !store.state.user.is_login) {
        next({ name: "user_login" });

    } else {

        next();
    }
})

export default router