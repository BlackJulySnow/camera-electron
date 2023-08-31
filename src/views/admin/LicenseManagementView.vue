<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <el-card>
                <p>当前系统时间：{{ time }}</p>
            </el-card>
            <div class="card mt-4">
                <div class="card-header text-center">
                    <h3>授权管理<el-button class="float-end" type="primary" plain @click="addDialog = true">新增</el-button>
                        <el-dialog v-model="addDialog" title="新增" width="30%">
                            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                                <el-form-item label="注册码">
                                    <el-input v-model="form.key" :autosize="{ minRows: 6, maxRows: 12 }" type="textarea" />
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button @click="addDialog = false">取消</el-button>
                                    <el-button type="success" @click="getMachineCode()">
                                        获取机器码
                                    </el-button>
                                    <el-button type="primary" @click="addLicense()">
                                        增加
                                    </el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </h3>
                </div>
                <div class="card-body">
                    <el-table :data="lisenceList" style="width: 100%">
                        <el-table-column label="序号" type="index" width="100" />
                        <el-table-column prop="channelNum" label="通道数量" sortable />
                        <el-table-column prop="expireTime" label="过期时间" sortable :formatter="timeFormatter" />
                        <el-table-column width="100" align="right">
                            <template #default="scope">
                                <el-button type="danger" :icon="Delete" circle @click="handleDelete(scope.row.id)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <el-dialog v-model="getMachine" title="获取机器码" width="50%">
            <el-input v-model="code" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" disabled />
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="getMachine = false">取消</el-button>
                    <el-button type="primary" @click="copy()" class="none">
                        复制
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import { getRequest, postRequest } from '@/utils/http';
import { message } from '@/utils/messageBox';
import { reactive, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue'
import Clipboard from 'clipboard';

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
        getMachineCode() {
            const that = this;
            getRequest("/license/getMachineCode", {},
                function success(resp) {
                    that.code = resp;
                    that.getMachine = true;
                }, function error() {
                    message('错误', 'error');
                })
        },
        copy() {
            const that = this;
            let clipboard = new Clipboard('.none', {
                text: () => {
                    return that.code
                }
            });
            clipboard.on('success', () => {
                message('复制成功', 'success');
                clipboard.destroy()
                that.getMachine = false;
                that.code = '';
            })
            clipboard.on('error', () => {
                message('该浏览器不支持自动复制', 'error');
                clipboard.destroy()
            })
        },
        addLicense() {
            const that = this;
            postRequest("/license/add", {
                key: that.form.key,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.addDialog = false;
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message("添加失败", 'error');
            })
        },
        handleDelete(id) {
            const that = this;
            postRequest("/license/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message("删除失败", 'error');
            })
        },
        timeFormatter(row, column, cellValue) {
            let format = 'YYYY-mm-dd HH:MM:SS'
            let date = new Date(cellValue);
            const dataItem = {
                'Y+': date.getFullYear().toString(),
                'm+': (date.getMonth() + 1).toString(),
                'd+': date.getDate().toString(),
                'H+': date.getHours().toString(),
                'M+': date.getMinutes().toString(),
                'S+': date.getSeconds().toString(),
            };
            Object.keys(dataItem).forEach((item) => {
                const ret = new RegExp(`(${item})`).exec(format);
                if (ret) {
                    format = format.replace(ret[1], ret[1].length === 1 ? dataItem[item] : dataItem[item].padStart(ret[1].length, '0'));
                }
            });
            return format
        },
    },
    created() {
        this.timer = setInterval(() => {
            this.timestamp += 1000;
            this.time = this.timestampToTime(this.timestamp);
        }, 1000)
    },
    beforeRouteLeave() {
        clearInterval(this.timer);
    }
}
</script>

<style scoped></style>