<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>组别管理
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-input placeholder="搜索组号(英文逗号分割批量搜索)" v-model="groupId">
                                    <template #append>
                                        <el-button @click="searchDialog = true">批量搜索</el-button>
                                    </template>
                                </el-input>
                            </el-col>
                            <el-col :span="11">
                                <el-input placeholder="搜索组名" v-model="groupName" />
                            </el-col>
                            <el-col :span="2">
                                <el-button :icon="Search" circle type="success" @click="select()" />
                            </el-col>
                        </el-row>
                        <!--  -->

                    </h3>
                </div>
                <div class="card-body">
                    <el-table :data="groupList" style="width: 100%" height="540" @sort-change="sortChange">
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="id" label="编号" sortable="custom" />
                        <el-table-column prop="name" label="组名" sortable="custom" />
                        <el-table-column prop="company.companyName" label="公司名称" v-if="$store.state.user.company.id == 1" />
                        <el-table-column>
                            <template #header>
                                <el-button class="float-end" type="primary" plain @click="addDialog = true">新增</el-button>
                            </template>
                            <template #default="scope">
                                <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                <el-popconfirm width="200" confirm-button-text="确认" cancel-button-text="取消"
                                    confirm-button-type="danger" cancel-button-type="info" :hide-after="50" title="确认删除？"
                                    @confirm="handleDelete(scope.row.id)">
                                    <template #reference>
                                        <el-button type="danger" :icon="Delete" circle />
                                    </template>
                                </el-popconfirm>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-dialog v-model="editDialog" title="编辑" width="30%" @close="handleEditClose">
                    <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                        <el-form-item label="组号">
                            <el-input v-model="form.id" disabled />
                        </el-form-item>
                        <el-form-item label="组名">
                            <el-input v-model="form.name" />
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="editDialog = false">取消</el-button>
                            <el-button type="primary" @click="editGroup()">
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
            <el-dialog v-model="addDialog" title="新增" width="30%">
                <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                    <el-form-item label="组名">
                        <el-input v-model="form.name" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addDialog = false">取消</el-button>
                        <el-button type="primary" @click="addGroup()">
                            增加
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog v-model="searchDialog" title="批量搜索(每个组号以回车分割)" width="30%" @close="handleClose">
                <el-input v-model="searchId" :autosize="{ minRows: 8, maxRows: 16 }" type="textarea" />
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="searchDialog = false">取消</el-button>
                        <el-button type="primary" @click="search()">
                            搜索
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { postRequest } from '@/utils/http';
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import { reactive } from 'vue'
import { message } from '@/utils/messageBox';
import { userRole } from "@/global";

export default {
    setup() {
        const form = reactive({
            id: '',
            name: '',
        })
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let groupList = ref([]);
        let sortBy = ref("id");
        let desc = ref(false);
        let addDialog = ref(false);
        let editDialog = ref(false);
        let searchDialog = ref(false);
        let searchId = ref('');
        let groupName = ref('');
        let groupId = ref('');

        const select = () => {
            postRequest("/group/select", {
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
                groupId: groupId.value,
                groupName: groupName.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    total.value = resp.data.totalElements;
                    groupList.value = resp.data.content;
                } else {
                    message(resp.msg, 'error');
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

        select();
        return {
            Edit,
            Delete,
            Search,
            form,
            addDialog,
            groupList,
            groupName,
            groupId,
            total,
            editDialog,
            pageSize,
            current_page,
            userRole,
            searchDialog,
            searchId,
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
            this.groupId = this.searchId.replace(/\n/g, ",");
        },
        search() {
            this.groupId = this.searchId.replace(/\n/g, ",");
            this.select()
            this.searchDialog = false;
        },
        edit(group) {
            const that = this;
            that.form.id = group.id;
            that.form.name = group.name;
            that.editDialog = true;
        },
        handleEditClose() {
            this.form.id = "";
            this.form.name = "";
        },
        addGroup() {
            const that = this;
            postRequest("/group/add", {
                groupName: that.form.name,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.handleEditClose();
                    that.addDialog = false;
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message("添加失败", 'error');
            })
        },
        editGroup() {
            const that = this;
            postRequest("/group/edit", {
                id: that.form.id,
                name: that.form.name,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.handleEditClose();
                    that.editDialog = false;
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message("修改失败", 'error');
            })
        },
        handleDelete(id) {
            const that = this;
            postRequest("/group/delete", {
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
        }
    },
}
</script>

<style scoped></style>