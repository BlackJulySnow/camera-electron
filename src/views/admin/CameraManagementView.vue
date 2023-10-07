<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>录像机管理<el-button class="float-end" type="primary" plain @click="addDialog = true">新增</el-button>
                        <el-dialog v-model="addDialog" title="新增" width="30%">
                            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                                <el-form-item label="录像机ip">
                                    <el-input v-model="form.ip" placeholder="请输入ip" />
                                </el-form-item>
                                <el-form-item label="录像机端口">
                                    <el-input v-model="form.port" placeholder="请输入端口" />
                                </el-form-item>
                                <el-form-item label="用户名">
                                    <el-input v-model="form.username" placeholder="请输入摄像机用户名" />
                                </el-form-item>
                                <el-form-item label="密码">
                                    <el-input v-model="form.password" type="password" show-password
                                        placeholder="请输入摄像机密码" />
                                </el-form-item>
                                <el-form-item label="字体大小">
                                    <el-input v-model="form.fontSize" placeholder="请输入水印字体大小" />
                                </el-form-item>
                                <el-form-item label="水印距离">
                                    <el-input v-model="form.padding" placeholder="请输入水印距离" />
                                </el-form-item>
                                <el-form-item label="类型">
                                    <el-select v-model="form.type" placeholder="请选择摄像机类型" style="width:100%">
                                        <el-option v-for="camera in cameraType" :key="camera.value" :label="camera.label"
                                            :value="camera.value" />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button @click="addDialog = false">取消</el-button>
                                    <el-button type="primary" @click="addCamera()">
                                        增加
                                    </el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </h3>
                </div>
                <div class="card-body">
                    <el-table :data="cameraList" style="width: 100%" height="540" @sort-change="sortChange">
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="ip" label="ip" sortable="costom" width="100" />
                        <el-table-column prop="port" label="端口" sortable="costom" />
                        <el-table-column prop="type" label="类型" :formatter="Formatter" />
                        <el-table-column prop="company.companyName" label="公司名称" v-if="$store.state.user.company.id == 1" />
                        <el-table-column prop="username" label="用户名" />
                        <!-- <el-table-column prop="password" label="密码" :formatter="passwordFormatter" /> -->
                        <el-table-column width="300">
                            <template #default="scope">
                                <el-button type="warning" round @click="channelSelect(scope.row.id)">通道编辑</el-button>
                                <el-button type="warning" round @click="watermarkSelect(scope.row.id)">水印编辑</el-button>
                                <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                <el-button type="danger" :icon="Delete" circle @click="handleDelete(scope.row.id)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-dialog v-model="editDialog" title="编辑" width="30%">
                    <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                        <el-form-item label="录像机ip">
                            <el-input v-model="form.ip" placeholder="请输入ip" />
                        </el-form-item>
                        <el-form-item label="录像机端口">
                            <el-input v-model="form.port" placeholder="请输入端口" />
                        </el-form-item>
                        <el-form-item label="用户名">
                            <el-input v-model="form.username" placeholder="请输入摄像机用户名" />
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input v-model="form.password" type="password" show-password placeholder="请输入摄像机密码" />
                        </el-form-item>
                        <el-form-item label="字体大小">
                            <el-input v-model="form.fontSize" placeholder="请输入水印字体大小" />
                        </el-form-item>
                        <el-form-item label="水印距离">
                            <el-input v-model="form.padding" placeholder="请输入水印距离" />
                        </el-form-item>
                        <el-form-item label="类型">
                            <el-select v-model="form.type" style="width:100%" placeholder="请选择摄像机类型">
                                <el-option v-for="camera in cameraType" :key="camera.value" :label="camera.label"
                                    :value="camera.value" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="editDialog = false">取消</el-button>
                            <el-button type="primary" @click="editUser()">
                                修改
                            </el-button>
                        </span>
                    </template>
                </el-dialog>
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
    <el-dialog v-model="editChannel" title="编辑通道" width="30%">
        <el-table :data="channelList" style="width: 100%" height="540">
            <el-table-column align="center" prop="channelName" class="m-2" label="通道名称" sortable />
            <el-table-column align="center" prop="channel" class="m-2" label="通道号" sortable />
            <el-table-column width="100" align="right">
                <template #default="scope">
                    <el-button type="danger" :icon="Delete" circle @click="channelDelete(scope.row.id)" />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="autoDetect">通道检测</el-button>
                <el-button type="success" @click="addChannel = true">增加</el-button>
                <el-button type="primary" @click="editChannel = false">确认</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog v-model="addChannel" title="添加通道" width="30%">
        <el-input v-model="channel" placeholder="通道号" class="mt-2" />
        <el-input v-model="channelName" placeholder="通道名称" class="mt-2" />
        <template #footer>
            <span class="dialog-footer">

                <el-button @click="addChannel = false">取消</el-button>
                <el-button type="primary" @click="addChannelFunc">确认</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog v-model="editWatermark" title="编辑水印" width="50%">
        <el-table :data="watermarkList" style="width: 100%" height="540">
            <el-table-column prop="type" label="水印类型" :formatter="typeFormatter" />
            <el-table-column prop="text" label="水印文字" :formatter="textFormatter" />
            <el-table-column prop="position" label="水印位置" :formatter="positionFormatter" />
            <el-table-column width="100" align="right">
                <template #default="scope">
                    <el-button type="danger" :icon="Delete" circle @click="watermarkDelete(scope.row.id)" />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="success" @click="addWatermark = true">增加</el-button>
                <el-button type="primary" @click="editWatermark = false">确认</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog v-model="addWatermark" title="添加水印" width="30%">
        <el-row :gutter="20" class="mt-4">
            <el-col :span="4">
                <span class="ml-3 w-35 text-gray-600 inline-flex items-center">水印文字</span>
            </el-col>
            <el-col :span="20">
                <el-input v-model="watermark" label="水印文字" placeholder="自定义水印文字" :disabled="inputDisabled" />
            </el-col>
        </el-row>
        <el-row :gutter="20" class="mt-4">
            <el-col :span="4">
                <span class="ml-3 w-35 text-gray-600 inline-flex items-center">显示位置</span>
            </el-col>
            <el-col :span="20">
                <el-select v-model="position" :disabled="inputDisabled" style="width: 100%">
                    <el-option label=" 左上" :value="0"></el-option>
                    <el-option label="左下" :value="1"></el-option>
                    <el-option label="右上" :value="2"></el-option>
                    <el-option label="右下" :value="3"></el-option>
                </el-select>
            </el-col>
        </el-row>
        <!--        <el-row :gutter="20" class="mt-4">-->
        <!--            <el-col :span="4">-->
        <!--                <span class="ml-3 w-35 text-gray-600 inline-flex items-center">水印类型</span>-->
        <!--            </el-col>-->
        <!--            <el-col :span="20">-->
        <!--                <el-checkbox v-model="check1" :disabled="checkboxDisabled">订单编号</el-checkbox>-->
        <!--                <el-checkbox v-model="check2" :disabled="checkboxDisabled">工位</el-checkbox>-->
        <!--            </el-col>-->
        <!--        </el-row>-->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="addWatermark = false">取消</el-button>
                <el-button type="primary" @click="addWatermarkFunc">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script>
import { ref } from 'vue';
import { postRequest, flaskRequest } from '@/utils/http';
import { Delete, Edit, Plus, Monitor } from '@element-plus/icons-vue'
import { reactive } from 'vue'
import { message } from '@/utils/messageBox';
import { cameraType } from '@/global'

export default {
    setup() {
        const form = reactive({
            id: '',
            ip: '',
            password: '',
            username: '',
            port: '',
            type: 0,
            fontSize: 20,
            padding: 100,
        })
        let total = ref(0);
        let current_page = ref(1);
        let page = ref();
        let pageSize = ref(10);
        let cameraList = ref([]);
        let sortBy = ref("id");
        let desc = ref(false);
        let channelList = ref([]);
        let watermarkList = ref([]);
        let editWatermark = ref(false);
        let addDialog = ref(false);
        let addWatermark = ref(false);
        let editDialog = ref(false);
        let editChannel = ref(false);
        let addChannel = ref(false);
        let camera_id = ref(0);
        let channel = ref('');
        let check1 = ref(false)
        let check2 = ref(false)
        let position = ref(0)
        let watermark = ref('');
        let inputDisabled = ref(false);
        let checkboxDisabled = ref(false);
        let channelName = ref('');

        const select = () => {
            postRequest("/camera/select", {
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    total.value = resp.data.totalElements;
                    cameraList.value = resp.data.content;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                // message('摄像头查询失败', 'error');
                message(resp.responseJSON.msg, 'error');
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

        const channelSelect = (id) => {
            camera_id.value = id;
            postRequest("/channel/select", {
                camera_id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    channelList.value = resp.data;
                }
            }, function error() {
                message('通道查询失败', 'error');
            })
            editChannel.value = true;
        }

        select();

        return {
            Edit,
            Delete,
            Plus,
            Monitor,
            form,
            addDialog,
            page,
            cameraList,
            channelList,
            editDialog,
            pageSize,
            addWatermark,
            channelSelect,
            watermarkList,
            editWatermark,
            addChannel,
            camera_id,
            total,
            current_page,
            editChannel,
            channel,
            channelName,
            select,
            sortChange,
            check1,
            check2,
            position,
            watermark,
            cameraType,
            checkboxDisabled,
            inputDisabled,
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
        handleClose() {
            const that = this;
            that.form.id = '';
            that.form.ip = '';
            that.form.username = '';
            that.form.password = '';
            that.form.port = '';
            that.form.type = 0;

        },
        Formatter(row) {
            if (row.type == 0) {
                return "海康威视";
            } else if (row.type == 1) {
                return "大华";
            }
        },
        positionFormatter(row) {
            let Position = ['左上', '左下', '右上', '右下'];
            return Position[row.position];
        },
        addCamera() {
            const that = this;
            postRequest("/camera/add", {
                ip: that.form.ip,
                username: that.form.username,
                password: that.form.password,
                port: that.form.port,
                type: that.form.type,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                } else {
                    message(resp.msg, 'warning');
                }
                that.addDialog = false;
                that.select(1);
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('添加失败', 'error');
            })
        },
        handleDelete(id) {
            const that = this;
            postRequest("/camera/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.select(1);
                    message('删除成功', 'success');
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('删除失败', 'error');
            })
        },
        edit(camera) {
            const that = this;
            that.form.id = camera.id;
            that.form.ip = camera.ip;
            that.form.username = camera.username;
            that.form.password = camera.password;
            that.form.port = camera.port;
            that.form.type = camera.type;
            that.form.fontSize = camera.fontSize;
            that.form.padding = camera.padding;
            that.editDialog = true;
        },
        editUser() {
            const that = this;
            postRequest("/camera/update", {
                id: that.form.id,
                ip: that.form.ip,
                username: that.form.username,
                password: that.form.password,
                port: that.form.port,
                type: that.form.type,
                fontSize: that.form.fontSize,
                padding: that.form.padding,
            }, function success(resp) {
                if (resp.code == '200') {
                    message('修改成功', 'success');
                } else {
                    message(resp.msg, 'warning');
                }
                that.editDialog = false;
                that.select(1);
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('修改失败', 'error');
            })
        },
        channelDelete(id) {
            const that = this;
            postRequest("/channel/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.channelSelect(that.camera_id);
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('删除失败', 'error');
            })
        },
        addChannelFunc() {
            const that = this;
            postRequest("/channel/add", {
                channel: that.channel,
                camera_id: that.camera_id,
                channelName: that.channelName,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.channelSelect(that.camera_id);
                    that.channel = '';
                    that.channelName = '';
                    that.addChannel = false;
                } else {
                    message(resp.msg, 'warning');
                }
            })
        },
        autoDetect() {
            const that = this;
            flaskRequest("/autoDetect", {
                cameraId: that.camera_id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.channelSelect(that.camera_id);
                } else {
                    message(resp.msg, 'warning');
                }
            })
        },
        watermarkSelect(id) {
            const that = this;
            that.editWatermark = true;
            that.camera_id = id;
            postRequest("/watermark/select", {
                cameraId: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.watermarkList = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('水印查询失败', 'error');
            })
        },
        watermarkDelete(id) {
            const that = this;
            postRequest("/watermark/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.watermarkSelect(that.camera_id);
                    message(resp.msg, 'success');
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('删除失败', 'error');
            })
        },
        addWatermarkFunc() {
            const that = this;
            postRequest("/watermark/add", {
                camera_id: that.camera_id,
                type: that.calc(that.check2, 1) | that.calc(that.check1, 2),
                text: that.watermark,
                position: that.position,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.check1 = false;
                    that.check2 = false;
                    that.watermark = '';
                    that.position = 0;
                    that.watermarkSelect(that.camera_id);
                    message(resp.msg, 'success');
                    that.addWatermark = false;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('添加失败', 'error');
            })
        },
        calc(state, num) {
            return state ? (1 << num - 1) : 0;
        },
        typeFormatter(row) {
            if (row.type != 0)
                return '动态水印'
            return '自定义水印'
        },
        textFormatter(row, column, cellValue) {
            let type = row.type;
            if (type == 0) {
                return cellValue;
            } else if (type == 3) {
                return "订单编号-工位"
            } else if (type == 2) {
                return "订单编号"
            } else if (type == 1) {
                return "工位"
            }
            return '';
        },
        passwordFormatter() {
            return "******";
        }
    },
    watch: {
        addDialog(newV) {
            if (newV === false) {
                this.handleClose();
            }
        },
        editDialog(newV) {
            if (newV === false) {
                this.handleClose();
            }
        },
        pageSize() {
            this.select(1, this.key);
        },
        check1() {
            this.inputDisabled = this.check1 || this.check2;
            this.position = 0;
        },
        check2() {
            this.inputDisabled = this.check1 || this.check2;
            this.position = 0;
        },
        watermark(newV) {
            if (newV != '') {
                this.checkboxDisabled = true;
            } else {
                this.checkboxDisabled = false;
            }
        },
    },
}
</script>

<style scoped></style>