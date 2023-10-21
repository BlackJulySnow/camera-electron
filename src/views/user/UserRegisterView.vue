<template>
    <!-- <el-header></el-header> -->
    <el-header></el-header>
    <div class="justify-content-md-center mt-8" v-if="!$store.state.user.pulling_info" style="width: 100%;">
        <div class="container right-panel-active" id="container">
            <div class="form-container sign-in-container">
                <form @submit.prevent="register">
                    <h1>注册</h1>
                    <el-input type="text" placeholder="企业号" v-model="companyId" class="mt-2" disabled />
                    <el-input type="text" placeholder="会员号" v-model="username" class="mt-2" />
                    <el-input type="password" placeholder="密码" v-model="password" class="mt-2" show-password />
                    <el-input v-model="companyName" class="mt-2" placeholder="企业名" />
                    <el-input v-model="userName" class="mt-2" placeholder="企业代表姓名" />
                    <el-input v-model="phone" class="mt-2" placeholder="企业代表电话">
                        <template #append>
                            <el-button :icon="Message" @click="openVerifyDialog()" :disabled="getCodeBtnDisable">{{ btntxt
                            }}</el-button>
                        </template>
                    </el-input>
                    <el-input v-model="code" class="mt-2" placeholder="验证码" />
                    <el-cascader :options="areajson" ref="address" @change="handleChange()" class="mt-2" style="width: 100%"
                        placeholder="企业地址">
                        <template #default="{ node, data }">
                            <span>{{ data.label }}</span>
                            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                        </template>
                    </el-cascader>
                    <el-select v-model="businessType" class="m-2" placeholder="选择业务类型" style="width: 100%">
                        <el-option v-for="businessType in businessTypes" :key="businessType.value"
                            :label="businessType.label" :value="businessType.value" />
                    </el-select>
                    <el-select v-model="platform" placeholder="选择电商平台" style="width: 100%">
                        <el-option v-for="commerce1 in commerce" :key="commerce1.value" :label="commerce1.label"
                            :value="commerce1.value" />
                    </el-select>
                    <button class="mt-2 button">注册</button>
                </form>
            </div>
            <div class="overlay-container">
                <div class="overlay">
                    <div class="overlay-panel overlay-left">
                        <h1>货查查视频追溯系统</h1>
                    </div>
                </div>
            </div>
            <footer>
                <p>汕头市展华信息科技有限公司</p>
            </footer>
        </div>
        <el-dialog v-model="verifyDialog" :width="width + 40" :show-close="false" align-center>
            <slide-verify :w="width" ref="block" class="silde_box" slider-text="向右滑动->" :accuracy="5" @success="onSuccess"
                @fail="onFail" @again="onAgain" />
        </el-dialog>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { ref } from 'vue'
import router from '@/router/index'
import { message } from '@/utils/messageBox'
import { businessTypes, commerce } from '@/global'
import { areajson } from '@/areaGlobal'
import { loginRequest } from '@/utils/http'
import { Message } from '@element-plus/icons-vue'
import SlideVerify from "vue3-slide-verify";
import "vue3-slide-verify/dist/style.css";

export default {
    components: {
        SlideVerify,
    },
    setup() {
        let width = document.documentElement.clientHeight * 0.3;
        const store = useStore();
        const block = ref();
        let username = ref('');
        let btntxt = ref('');
        let password = ref('');
        let code = ref('');
        let userName = ref('');
        let businessType = ref('');
        let phone = ref('');
        let area = ref('');
        let platform = ref('');
        let companyId = ref('');
        let companyName = ref('');
        let waitTime = 60;
        let getCodeBtnDisable = ref(false);
        let verifyDialog = ref(false);

        const data = JSON.parse(localStorage.getItem("data"));
        if (data) {
            store.commit("updateToken", data.jwtToken);
            store.dispatch("getinfo", {
                success() {
                    store.commit("updatePullingInfo", false);
                    router.push(store.state.user.from_page);
                },
            })
        } else {
            store.commit("updatePullingInfo", false);
        }

        const getCompanyId = () => {
            loginRequest("/company/getCompanyId", {},
                function success(resp) {
                    if (resp.code == 200) {
                        companyId.value = resp.data;
                    } else {
                        message(resp.msg, 'warning');
                    }
                }, function error() {
                    message("获取错误", "error");
                })
        }
        getCompanyId();

        const register = () => {
            loginRequest("/company/register", {
                username: username.value,
                password: password.value,
                userName: userName.value,
                type: businessType.value,
                phone: phone.value,
                address: area.value,
                platform: platform.value,
                companyName: companyName.value,
                code: code.value,
            }, function success(resp) {
                if (resp.code == 200) {
                    message(resp.msg, 'success');
                    router.push({ name: "user_login" });
                } else {
                    message(resp.msg, 'warning');
                }

            }, function error(resp) {
                console.log(resp);
            })
        }

        return {
            Message,
            waitTime,
            username,
            password,
            code,
            btntxt,
            areajson,
            width,
            businessTypes,
            commerce,
            getCodeBtnDisable,
            userName,
            businessType,
            phone,
            area,
            block,
            platform,
            companyId,
            companyName,
            register,
            verifyDialog,
        }
    },
    methods: {
        handleChange() {
            let areaTextArr = ""
            let arr = this.$refs["address"].getCheckedNodes()[0].pathNodes;
            arr.forEach((i) => {
                areaTextArr += i.label;
            });
            this.area = areaTextArr;
            console.log(this.area);
        },
        openVerifyDialog() {
            this.verifyDialog = true;
        },
        onSuccess() {
            const that = this;
            this.verifyDialog = false;
            that.block.refresh();
            that.getCodeBtnDisable = true
            that.btntxt = `(${that.waitTime})`
            let timer = setInterval(function () {
                if (that.waitTime > 1) {
                    that.waitTime--
                    that.btntxt = `(${that.waitTime})`
                } else {
                    clearInterval(timer)
                    that.btntxt = ''
                    that.getCodeBtnDisable = false
                    that.waitTime = 60
                }
            }, 1000);
            loginRequest("/company/sendSms", {
                phone: that.phone
            }, function success(resp) {
                message(resp.msg, "success");
            }, function error() {
                message("获取验证码失败", "error");
            })
        },
        onFail() {
            message("验证失败", 'warning')
        },
        onAgain() {
            message('检测到非人为操作', 'error')
        }
    }
}
</script>

<style scoped>
/*@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');*/

* {
    box-sizing: border-box;
}

body {
    background: #f6f5f7;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-family: 'Montserrat', sans-serif;
    height: 100vh;
    margin: -20px 0 50px;
}

h1 {
    font-weight: bold;
    margin: 0;
}

h2 {
    text-align: center;
}

p {
    font-size: 14px;
    font-weight: 100;
    line-height: 20px;
    letter-spacing: 0.5px;
    margin: 20px 0 30px;
}

span {
    font-size: 12px;
}

a {
    color: #333;
    font-size: 14px;
    text-decoration: none;
    margin: 15px 0;
}

.button {
    border-radius: 20px;
    border: 1px solid #FF4B2B;
    background-color: #FF4B2B;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
}

.button:active {
    transform: scale(0.95);
}

.button:focus {
    outline: none;
}

form {
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 50px;
    height: 100%;
    text-align: center;
}

.container {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    position: relative;
    overflow: hidden;
    width: 768px;
    max-width: 100%;
    min-height: 480px;
    height: 70vh;
}

.form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
}

.sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
}

.container.right-panel-active .sign-in-container {
    transform: translateX(100%);
}

.container.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
}

@keyframes show {

    0%,
    49.99% {
        opacity: 0;
        z-index: 1;
    }

    50%,
    100% {
        opacity: 1;
        z-index: 5;
    }
}

.overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 100;
}

.container.right-panel-active .overlay-container {
    transform: translateX(-100%);
}

.overlay {
    background: #FF416C;
    background: -webkit-linear-gradient(to right, #FF4B2B, #FF416C);
    background: linear-gradient(to right, #FF4B2B, #FF416C);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0 0;
    color: #FFFFFF;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
    transform: translateX(50%);
}

.overlay-panel {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.overlay-left {
    transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
    transform: translateX(0);
}

.overlay-right {
    right: 0;
    transform: translateX(0);
}

.container.right-panel-active .overlay-right {
    transform: translateX(20%);
}

footer {
    background-color: #222;
    color: #fff;
    font-size: 14px;
    bottom: 0;
    position: fixed;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 999;
}

footer p {
    margin: 10px 0;
}
</style>
