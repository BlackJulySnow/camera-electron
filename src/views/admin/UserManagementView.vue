<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>用户管理<el-button class="float-end" type="primary" plain @click="addDialog = true">新增</el-button>
                        <el-dialog v-model="addDialog" title="新增" width="30%">
                            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                                <el-form-item label="账号">
                                    <el-input v-model="form.id" placeholder="请输入账号" />
                                </el-form-item>
                                <el-form-item label="姓名">
                                    <el-input v-model="form.name" placeholder="请输入姓名" />
                                </el-form-item>
                                <el-form-item label="密码">
                                    <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
                                </el-form-item>
                                <el-form-item label="是否启用">
                                    <el-switch class="ml-2" v-model="form.enable"
                                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                                </el-form-item>
                                <el-form-item label="权限">
                                    <el-select v-model="form.role" placeholder="选择用户权限" style="width:100%">
                                        <el-option v-for="role in userRole" :key="role.value" :label="role.label"
                                            :value="role.value" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="组别">
                                    <el-select v-model="form.group" placeholder="选择用户组别" style="width:100%">
                                        <el-option v-for="group in groupList" :key="group.id" :label="group.name"
                                            :value="group.id" />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button @click="addDialog = false">取消</el-button>
                                    <el-button type="primary" @click="addUser()">
                                        增加
                                    </el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </h3>
                </div>
                <div class="card-body">
                    <el-table :data="userList" style="width: 100%" height="540" @sort-change="sortChange">
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="id" label="账号" sortable="custom" />
                        <el-table-column prop="name" label="姓名" sortable="custom" />
                        <el-table-column prop="enable" label="是否启用">
                            <template #default="scope">
                                <el-switch class="ml-2" v-model="scope.row.enable" disabled
                                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="role" label="权限" :formatter="roleFormatter" />
                        <el-table-column prop="group.name" label="组别" />
                        <el-table-column prop="company.companyName" label="公司名称" v-if="$store.state.user.company.id == 1" />

                        <el-table-column width="200">
                            <template #header>
                                <el-input v-model="key" placeholder="姓名关键字" />
                            </template>
                            <template #default="scope">
                                <el-button type="primary" @click="ShowQrCode(scope.row.id)">二维码</el-button>
                                <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                <el-button type="danger" :icon="Delete" circle @click="handleDelete(scope.row.id)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-dialog v-model="editDialog" title="编辑" width="30%">
                    <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                        <el-form-item label="账号">
                            <el-input v-model="form.id" disabled />
                        </el-form-item>
                        <el-form-item label="姓名">
                            <el-input v-model="form.name" />
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input v-model="form.password" type="password" show-password />
                        </el-form-item>
                        <el-form-item label="是否启用">
                            <el-switch class="ml-2" v-model="form.enable"
                                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                        </el-form-item>
                        <el-form-item label="权限">
                            <el-select v-model="form.role" placeholder="选择用户权限" style="width:100%">
                                <el-option v-for="role in userRole" :key="role.value" :label="role.label"
                                    :value="role.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="组别">
                            <el-select v-model="form.group" placeholder="选择用户组别" style="width:100%">
                                <el-option v-for="group in groupList" :key="group.id" :label="group.name"
                                    :value="group.id" />
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
                <el-dialog v-model="imageDialog" title="登录二维码">
                    请用扫码枪扫描二维码进行登录
                    <el-row justify="center">
                        <el-image :src="imgSrc" fit="cover" :preview-src-list="imageList" hide-on-click-modal />
                    </el-row>
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
</template>

<script>
import { ref } from 'vue';
import { postRequest, imageRequest } from '@/utils/http';
import { Delete, Edit } from '@element-plus/icons-vue'
import { reactive } from 'vue'
import { message } from '@/utils/messageBox';
import { userRole } from "@/global";
export default {
    setup() {
        const form = reactive({
            id: '',
            name: '',
            role: "ROLE_USER",
            enable: true,
            password: '',
            group: '',
        })
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let userList = ref([]);
        let sortBy = ref("id");
        let desc = ref(false);
        let addDialog = ref(false);
        let editDialog = ref(false);
        let key = ref('');
        let groupList = ref([]);
        let imgSrc = ref('');
        let imageDialog = ref(false);
        let imageList = ref([]);
        // const store = useStore();

        const select = () => {
            postRequest("/user/select", {
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
                key: key.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    total.value = resp.data.totalElements;
                    userList.value = resp.data.content;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                // console.log();
                message(resp.responseJSON.msg, 'error');
            })
        }

        const findGroup = () => {
            postRequest("/group/selectGroupByCompany", {
            }, function success(resp) {
                if (resp.code == '200') {
                    groupList.value = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
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
        findGroup();
        select();
        return {
            Edit,
            Delete,
            // store,
            form,
            addDialog,
            imageDialog,
            userList,
            key,
            total,
            editDialog,
            pageSize,
            current_page,
            groupList,
            userRole,
            imgSrc,
            imageList,
            select,
            sortChange,
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
            that.form.name = '';
            that.form.role = 'ROLE_USER';
            that.form.enable = true;
            that.form.password = '';
            that.form.group = '';
        },
        addUser() {
            const that = this;
            postRequest("/user/register", {
                id: that.form.id,
                name: that.form.name,
                password: that.form.password,
                role: that.form.role,
                enable: that.form.enable,
                group: that.form.group,
            }, function success(resp) {
                if (resp.code == '200') {
                    message('添加成功', 'success');
                } else {
                    message(resp.msg, 'warning');
                }
                that.addDialog = false;
                that.select();
            }, function error(resp) {
                // message('添加失败', 'error');
                message(resp.responseJSON.msg, 'error');

            })
        },
        handleDelete(id) {
            const that = this;
            postRequest("/user/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.select();
                    message(resp.msg, 'success');
                } else {
                    message(resp.msg, 'warning')
                }
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('删除失败', 'error');
            })
        },
        roleFormatter(row, column, cellValue) {
            for (let i of userRole) {
                if (i.value == cellValue) {
                    return i.label
                }
            }
        },
        editUser() {
            const that = this;
            postRequest("/user/update", {
                id: that.form.id,
                name: that.form.name,
                password: that.form.password,
                role: that.form.role,
                enable: that.form.enable,
                group: that.form.group,
            }, function success(resp) {
                if (resp.code == '200') {
                    message('修改成功', 'success');
                    that.editDialog = false;
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error(resp) {
                message(resp.responseJSON.msg, 'error');
                // message('修改失败', 'error');
            })
        },
        edit(user) {
            const that = this;
            that.form.id = user.id;
            that.form.name = user.name;
            that.form.role = user.role;
            that.form.enable = user.enable;
            that.form.password = '';
            that.form.group = user.group.id;
            that.editDialog = true;
        },
        ShowQrCode(id) {
            const that = this;
            imageRequest("/user/showQRCode", {
                uid: id,
            }, function success(resp) {
                let blob = new Blob([resp], { type: "image/png" });
                let url = window.URL.createObjectURL(blob);
                that.imgSrc = url;
                that.imageList = [url];
                that.imageDialog = true;
            }, function error(resp) {
                // console.log(resp);
                message(resp.responseJSON.msg, 'error');
            })
        }
    },
    watch: {
        addDialog(newV) {
            if (newV === false) {
                this.handleClose();
            }
        },
        key() {
            const that = this;
            that.select();
        },
        editDialog(newV) {
            if (newV === false) {
                this.handleClose();
            }
        },
        pageSize() {
            this.select();
        }
    }
}
</script>

<style scoped></style>