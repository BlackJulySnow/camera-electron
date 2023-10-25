<template>
    <NavBar></NavBar>
    <el-dialog v-model="dialogEnter" :title="'最新版本(' + version + ')'" width="50%" :close-on-click-modal="false"
        :close-on-press-escape="false" :show-close="false" align-center center>
        <el-divider></el-divider>
        <p v-for="(item, index) in releaseNotes" :key="index + 'release'">{{ index + 1 }}、{{ item }}</p>
        <el-divider content-position="right">更新日期:{{ formDate(updateDate) }}</el-divider>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="cancer">取消</el-button>
                <el-button type="primary" @click="enterUpdate">
                    更新
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog v-model="dialog" :title="'更新中(' + version + ')'" width="35%" :close-on-click-modal="false"
        :close-on-press-escape="false" :show-close="false" align-center center draggable>
        <el-row :gutter="20">
            <el-col :span="18">
                <el-progress :text-inside="true" :stroke-width="26" :percentage="progress" />
            </el-col>
            <el-col :span="6">{{ speedFormat(speed) }}</el-col>
        </el-row>
    </el-dialog>
    <router-view></router-view>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap"
import NavBar from '@/components/NarBar.vue'
import { ipcRenderer } from 'electron'
import { message } from '@/utils/messageBox'
import { ref } from "vue"
export default {

    components: {
        NavBar
    },
    setup() {
        let dialog = ref(false);
        let dialogEnter = ref(false);
        let progress = ref(0);
        let releaseNotes = ref([]);
        let version = ref('');
        let updateDate = ref('');
        let speed = ref('');
        ipcRenderer.send("checkForUpdate");
        ipcRenderer.on("message", (event, data) => {
            if (data.status == 1) {
                releaseNotes.value = data.msg.releaseNotes;
                version.value = data.msg.version;
                updateDate.value = data.msg.releaseDate;
                dialogEnter.value = true;
            } else if (data.status == 5) {
                dialog.value = false;
                message("下载成功，即将开始安装", 'success')
            } else if (data.status == 2) {
                ipcRenderer.send("removeListen");
                ipcRenderer.removeAllListeners("message")
                ipcRenderer.removeAllListeners("progress")
                message(data.msg, 'success');
            } else if (data.status == -1) {
                message(data.msg, 'error');
            } else {
                message(data.msg, 'success');
            }
        });
        ipcRenderer.on("progress", (event, data) => {
            progress.value = Math.trunc(data.percent);
            speed.value = data.speed;
        });

        return {
            dialog,
            dialogEnter,
            releaseNotes,
            version,
            progress,
            updateDate,
            speed
        }
    },
    methods: {
        enterUpdate() {
            this.dialogEnter = false;
            this.dialog = true;
            ipcRenderer.send("updateStart");
        },
        formDate(dateForm) {
            if (dateForm === "") {  //解决deteForm为空传1970-01-01 00:00:00
                return "";
            } else {
                var dateee = new Date(dateForm).toJSON();
                var date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
                return date;
            }
        },
        speedFormat(bytesPerSecond) {
            if (bytesPerSecond >= 1000000) {
                return (bytesPerSecond / 1000000).toFixed(2) + " Mb/s";
            } else if (bytesPerSecond >= 1000) {
                return (bytesPerSecond / 1000).toFixed(2) + " KB/s";
            } else {
                return bytesPerSecond.toFixed(2) + " B/s";
            }
        },
        cancer() {
            this.dialogEnter = false;
            ipcRenderer.send("removeListen");
            ipcRenderer.removeAllListeners("message")
            ipcRenderer.removeAllListeners("progress")
        }
    }

}
</script>
<style></style>
