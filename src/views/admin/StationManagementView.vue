<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>工位管理
                        <el-button class="float-end" type="primary" plain @click="addDialog = true">新增</el-button>
                        <el-dialog v-model="addDialog" title="工位设置" width="30%" @close="handleClear">
                            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                                <el-form-item label="工位IP">
                                    <el-input v-model="form.stationIp" />
                                </el-form-item>
                                <el-form-item label="工位名称">
                                    <el-input v-model="form.stationName" />
                                </el-form-item>
                                <el-form-item label="工位扫描类型">
                                    <el-input v-model="form.stationType" />
                                </el-form-item>
                                <el-form-item label="向前回溯时间">
                                    <el-input v-model="form.backtrack1" />
                                </el-form-item>
                                <el-form-item label="向后回溯时间">
                                    <el-input v-model="form.backtrack2" />
                                </el-form-item>
                                <!-- <el-form-item label="导出超时时间">
                                    <el-input v-model="form.timeout" />
                                </el-form-item> -->


                                <el-form-item label="录像机">
                                    <el-select v-model="form.cameraId" placeholder="选择录像机">
                                        <el-option v-for="camera in cameraList" :key="camera.id" :label="camera.ip"
                                            :value="camera.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="通道">
                                    <el-select v-model="form.channels" placeholder="选择通道" multiple collapse-tags
                                        collapse-tags-tooltip :max-collapse-tags="2" :multiple-limit="2">
                                        <el-option v-for="channel in channelList" :key="channel.id"
                                            :label="channel.channelName" :value="channel.id" />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button @click="handleClear()">取消</el-button>
                                    <el-button type="primary" @click="addStation()" v-if="!editFlag">
                                        增加
                                    </el-button>
                                    <el-button type="primary" @click="updateStation()" v-else>
                                        修改
                                    </el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </h3>
                </div>
                <div class="card-body">
                    <el-table :data="stationList" style="width: 100%" height="540" @sort-change="sortChange">
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="stationName" label="工位名称" sortable="costom" />
                        <el-table-column prop="stationIp" label="工位IP" sortable="costom" />
                        <el-table-column prop="stationType" label="工位扫描类型" sortable="costom" />
                        <el-table-column prop="lastUploadTime" label="在线情况" sortable="costom">
                            <template #default="scope">
                                <el-button type="success" v-if="status(scope.row.lastUploadTime)">在线</el-button>
                                <el-button type="danger" v-else>离线</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column width="200" align="right">
                            <template #default="scope">
                                <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                <el-button type="danger" :icon="Delete" circle @click="handleDelete(scope.row.id)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="card-footer">
                    <el-row justify="center">
                        <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total"
                            :current_page="current_page" :page-sizes="[10, 50, 100]" :page-size="pageSize"
                            @current-change="handleCurrentChange" @size-change="handleSizeChange" />
                    </el-row>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue';
import { postRequest } from '@/utils/http';
import { message } from '@/utils/messageBox';
import { reactive } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue'
import { useStore } from 'vuex';

export default {
    setup() {
        let form = reactive({
            stationName: "",
            stationIp: "",
            uid: "",
            channels: [],
            cameraId: '',
            cameraIp: '',
            backtrack1: '',
            backtrack2: '',
            timeout: '',
            stationType: '',
        })

        const store = useStore();
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let stationList = ref([]);
        let cameraList = ref([]);
        let channelList = ref([]);
        let sortBy = ref("id");
        let desc = ref(false);
        let editFlag = ref(false);
        let stationId = ref('');
        let stationType = ref('');

        let addDialog = ref(false);
        let justEdit = ref(false);

        const select = () => {
            postRequest("/station/select", {
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    total.value = resp.data.totalElements;
                    stationList.value = resp.data.content;
                }
            }, function error() {
                message('查询失败', 'error');
            })
        }

        const sortChange = (column) => {
            const prop = column.prop
            if (prop) {
                if (column.order == 'ascending') {
                    desc.value = false;
                    sortBy.value = prop
                } else if (column.order == 'descending') {
                    desc.value = true;
                    sortBy.value = prop
                } else if (column.order == null) {
                    sortBy.value = 'id'
                    desc.value = false;
                }
                select();
            }
        }

        const findAllCamera = () => {
            postRequest("/camera/findAllIdAndIP", {
            }, function success(resp) {
                if (resp.code == '200') {
                    cameraList.value = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('摄像头查询失败', 'error');
            })
        }

        select();
        findAllCamera();

        return {
            stationList,
            total,
            pageSize,
            current_page,
            form,
            addDialog,
            cameraList,
            channelList,
            editFlag,
            stationId,
            justEdit,
            stationType,
            store,

            Delete,
            Edit,

            sortChange,
            select,
        }
    },
    methods: {
        handleSizeChange(size) {
            this.pageSize = size;
            this.select();
        },
        handleCurrentChange(currentPage) {
            this.current_page = currentPage;
            this.select();
        },
        handleDelete(id) {
            const that = this;
            postRequest("/station/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.select();
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('删除失败', 'error');
            })
        },
        addStation() {
            const that = this;
            let string = that.form.channels.join();
            postRequest("/station/add", {
                stationName: that.form.stationName,
                stationIp: that.form.stationIp,
                channels: string,
                stationType: that.form.stationType,
                backtrack1: that.form.backtrack1,
                backtrack2: that.form.backtrack2,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.select();
                    that.handleClear();
                    that.addDialog = false;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('添加失败', 'error');
            })
        },
        handleClear() {
            this.form.channels = [];
            this.form.stationIp = '';
            this.form.stationName = '';
            this.form.cameraId = '';
            this.form.uid = '';
            this.form.cameraIp = '';
            this.editFlag = false;
            this.addDialog = false;
        },
        edit(station) {
            const that = this;
            that.justEdit = true;
            that.addDialog = true;
            that.editFlag = true;
            that.form.stationIp = station.stationIp;
            that.form.stationName = station.stationName;
            that.form.backtrack1 = station.backtrack1;
            that.form.backtrack2 = station.backtrack2;
            that.form.timeout = station.timeout;
            that.form.stationType = station.stationType;
            that.stationId = station.id;
            postRequest("/station/findStationChannel", {
                id: station.id,
            }, function success(resp) {
                if (resp.data[0] !== undefined && resp.data[0].camera != null) {
                    that.form.cameraId = resp.data[0].camera.id;
                    for (let i of resp.data) {
                        that.form.channels.push(i.id);
                    }
                }
            }, function error() {
                message('通道查询失败', 'error');
            })
        },
        updateStation() {
            const that = this;
            let channels = that.form.channels.join();
            postRequest("/station/update", {
                id: that.stationId,
                stationName: that.form.stationName,
                stationIp: that.form.stationIp,
                channels: channels,
                backtrack1: that.form.backtrack1,
                backtrack2: that.form.backtrack2,
                timeout: that.form.timeout,
                stationType: that.form.stationType,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.select();
                    that.handleClear();
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('修改失败', 'error');
            })
        },
        status(value) {
            if (value == undefined)
                return false;
            let last = new Date(value);
            let now = new Date();
            let state;
            let d = parseInt((now - last) / 1000 / 60);
            if (d >= 5) {
                state = false;
            } else {
                state = true;
            }
            return state;
        }
    },
    watch: {
        "form.cameraId"(newV) {
            const that = this;
            if (that.justEdit) {
                that.justEdit = false;
            } else {
                that.form.channels = [];
            }
            postRequest("/channel/select", {
                camera_id: newV,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.channelList = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('查询通道失败', 'error');
            })
        },
    }
}

</script>

