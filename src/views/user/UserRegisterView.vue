<template>
    <div class="row justify-content-md-center" style="width: 100%;">
        <div class="col-sm-4">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title text-center">注册</h4>
                </div>
                <form>
                    <div class="card-body" id="model-body">
                        <p style="color: red">{{ error_message }}</p>
                        <div class="form-group" style="margin: 10px auto;">
                            <input v-model="username" type="text" class="form-control" placeholder="用户名" autocomplete="off">
                        </div>
                        <div class="form-group" style="margin: 10px auto;">
                            <input v-model="name" type="text" class="form-control" placeholder="真实姓名" autocomplete="off">
                        </div>
                        <div class="form-group" style="margin: 10px auto;">
                            <input v-model="password" type="password" class="form-control" placeholder="密码"
                                autocomplete="off">
                        </div>
                        <div class="form-group" style="margin: 10px auto;">
                            <input v-model="confirm_password" type="password" class="form-control" placeholder="确认密码"
                                autocomplete="off">
                        </div>
                    </div>
                    <div class="card-footer">
                        <input type="submit" class="btn btn-primary form-control" value="注册" @click="register">
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import router from '@/router';
import { postRequest } from '@/utils/http';
import { ref } from 'vue';


export default {

    setup() {
        let error_message = ref('');
        let username = ref('');
        let password = ref('');
        let name = ref('');
        let confirm_password = ref('');
        const register = () => {
            postRequest("/user/register/", {
                username: username.value,
                name: name.value,
                password: password.value,
                conPassword: confirm_password.value,
            }, function success(resp) {
                if (resp.error_message != 'success') {
                    error_message.value = resp.error_message;
                } else {
                    router.push({ name: 'user_login' });
                }
            }, function error(resp) {
                console.log(resp);
            })
        }

        return {
            error_message,
            username,
            name,
            password,
            confirm_password,
            register,
        }
    }
}

</script>

<style scoped>
.card {
    margin-top: 20%;
}
</style>