<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light" v-if="route_name != 'video_view'">
        <div class="container">
            <router-link class="navbar-brand" :to="{ name: 'home' }">
                <img src="@/assets/logo.png" alt="" width="28" height="28" class="d-inline-block align-text-top">
            </router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item md-2" v-if="$store.state.user.is_login == true">
                        <router-link
                            :class="route_name == 'admin_goods_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_goods_management' }">
                            订单管理</router-link>
                    </li>
                    <li class="nav-item md-2" v-if="$store.state.user.is_login == true">
                        <router-link
                            :class="route_name == 'admin_video_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_video_management' }">
                            视频管理</router-link>
                    </li>
                    <li class="nav-item md-2" v-if="$store.state.user.role == 'ROLE_ADMIN'">
                        <router-link
                            :class="route_name == 'admin_station_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_station_management' }">
                            工位管理</router-link>
                    </li>
                    <li class="nav-item md-2" v-if="$store.state.user.role == 'ROLE_ADMIN'">
                        <router-link
                            :class="route_name == 'admin_camera_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_camera_management' }">
                            录像机管理</router-link>
                    </li>
                    <li class="nav-item md-2" v-if="$store.state.user.role == 'ROLE_ADMIN'">
                        <router-link
                            :class="route_name == 'admin_user_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_user_management' }">
                            用户管理</router-link>
                    </li>
                    <li class="nav-item md-2" v-if="$store.state.user.role == 'ROLE_ADMIN'">
                        <router-link
                            :class="route_name == 'admin_group_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_group_management' }">
                            组别管理</router-link>
                    </li>
                    <li class="nav-item md-2"
                        v-if="$store.state.user.role == 'ROLE_ADMIN' && $store.state.user.company.id == 1">
                        <router-link
                            :class="route_name == 'admin_license_management' ? 'nav-link active mleft' : 'mleft nav-link'"
                            aria-current="page" :to="{ name: 'admin_license_management' }">
                            系统设置</router-link>
                    </li>

                </ul>
                <ul class="navbar-nav" v-if="$store.state.user.is_login">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            {{ $store.state.user.name }}
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown" style="margin: 0;">
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><button class="dropdown-item" @click="logout">退出登录</button></li>
                        </ul>
                    </li>
                </ul>
                <ul class="navbar-nav" v-else-if="!$store.state.user.pulling_info || route_name == 'user_register'">
                    <li class="nav-item" style="margin:auto 10px;">
                        <router-link class="btn btn-primary" :to="{ name: 'user_login' }" role="button">
                            登录
                        </router-link>
                    </li>
                    <li class="nav-item" style="margin:auto 10px;">
                        <router-link class="btn btn-secondary" :to="{ name: 'user_register' }" role="button">
                            注册
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'
import router from '@/router/index'
// import path from 'path'
// import store from '@/store'

export default {
    setup() {
        // let templateFilePath = path.join(process.cwd(), '/resources/dist/app', 'app.exe')
        // console.log(templateFilePath);

        const store = useStore();
        const route = useRoute();

        let route_name = computed(() => route.name)
        const logout = () => {
            store.dispatch("logout");
            router.push({ name: 'user_login' })
        }
        return {
            route_name,
            logout,
        }
    },
}
</script>

<style scoped>
.navbar-nav>.nav-item>.active {
    border-bottom: 2px solid skyblue;
}

.mleft {
    margin-left: 40px;
}
</style>