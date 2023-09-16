<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <el-card>
                <p>当前系统时间：{{ time }}</p>
            </el-card>
            
    </div>
</template>
<script>
import { getRequest, postRequest } from '@/utils/http';
import { message } from '@/utils/messageBox';
import { reactive, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue'

export default {
    setup() {
        let lisenceList = ref([]);
        let addDialog = ref(false);
        let getMachine = ref(false);
        let code = ref('');
        let form = reactive({
            key: '',
        })

        let timestamp = ref();
        let time = ref('');
        let timer;

        const timestampToTime = (timestamp) => {
            var date = new Date(timestamp);
            var Y = date.getFullYear() + "-";
            var M =
                (date.getMonth() + 1 < 10
                    ? "0" + (date.getMonth() + 1)
                    : date.getMonth() + 1) + "-";
            var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
            var h = date.getHours().toString().padStart(2, 0) + ":";
            var m = date.getMinutes().toString().padStart(2, 0) + ":";
            var s = date.getSeconds().toString().padStart(2, 0);
            return Y + M + D + h + m + s;
        }

        const getTime = () => {
            getRequest("/config/systemTime", {},
                function success(resp) {
                    if (resp.code == '200') {
                        timestamp.value = resp.data;
                        time.value = timestampToTime(timestamp.value);
                    } else {
                        message(resp.msg, 'error');
                    }
                }, function error() {
                    message('获取系统时间出错', 'error');
                })
        }

        const select = () => {
            postRequest("/license/selectAll", {},
                function success(resp) {
                    if (resp.code == '200') {
                        lisenceList.value = resp.data;
                    } else {
                        message(resp.msg, 'error');
                    }
                }, function error(resp) {
                    message(resp.msg, 'error');
                }
            )
        }
        select();
        getTime();

        return {
            lisenceList,
            addDialog,
            getMachine,
            form,
            code,
            time,
            timer,
            timestamp,
            select,
            timestampToTime,
            Delete,
        }
    },
    methods: {
        
    },
}
</script>

<style scoped></style>