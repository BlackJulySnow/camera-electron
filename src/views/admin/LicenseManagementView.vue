<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <el-card>
                <p>当前系统时间：{{ time }}</p>
            </el-card>
            <div class="card mt-4" v-if="store.state.user.company.id == 1">
                <div class="card-header text-center">
                    <h3>授权管理</h3>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="startDate" type="datetime" placeholder="开始时间"
                                value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索企业名称" v-model="companyName" />
                        </el-col>
                    </el-row>
                    <el-row class="mt-2" :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="endDate" type="datetime" placeholder="结束时间"
                                value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索企业号(英文逗号分割批量搜索)" v-model="companyId">
                                <template #append>
                                    <el-button @click="searchDialog = true">批量搜索</el-button>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-button :icon="Search" circle type="success" @click="select()" />
                        </el-col>
                    </el-row>
                </div>
                <div class="card-body">
                    <el-table :data="lisenceList" style="width: 100%" height="540" @sort-change="sortChange">
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="companyId" label="企业号" sortable="costom" />
                        <el-table-column prop="companyName" label="企业名称" sortable="costom" />
                        <el-table-column prop="endDate" label="过期时间" sortable="costom" />
                        <el-table-column width="200" align="right">
                            <template #header>
                                <el-button type="primary" plain @click="addDialog = true">新增</el-button>
                            </template>
                            <template #default="scope">
                                <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                <el-button type="danger" :icon="Delete" circle @click="handleDelete(scope.row.id)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-dialog v-model="editDialog" title="编辑" width="30%" @close="handleEditClose">
                    <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                        <el-form-item label="编号">
                            <el-input v-model="form.id" disabled />
                        </el-form-item>
                        <el-form-item label="企业号">
                            <el-input v-model="form.companyId" />
                        </el-form-item>
                        <el-form-item label="企业名">
                            <el-input v-model="form.companyName" />
                        </el-form-item>
                        <el-form-item label="过期时间">
                            <el-date-picker v-model="form.endDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="editDialog = false">取消</el-button>
                            <el-button type="primary" @click="editCompany()">
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
        <el-dialog v-model="addDialog" title="新增" width="30%">
            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                <el-form-item label="企业号">
                    <el-input v-model="form.companyId" />
                </el-form-item>
                <el-form-item label="企业名">
                    <el-input v-model="form.companyName" />
                </el-form-item>
                <el-form-item label="过期时间">
                    <el-date-picker v-model="form.endDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addDialog = false">取消</el-button>
                    <el-button type="primary" @click="addLicense()">
                        增加
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="searchDialog" title="批量搜索(每个企业号以回车分割)" width="30%" @close="handleClose">
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
</template>
<script>
import { getRequest, postRequest } from '@/utils/http';
import { message } from '@/utils/messageBox';
import { reactive, ref } from 'vue';
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import Clipboard from 'clipboard';
import { useStore } from 'vuex';

export default {
    setup() {
        let lisenceList = ref([]);
        let addDialog = ref(false);
        let getMachine = ref(false);
        let code = ref('');
        let form = reactive({
            id: '',
            companyName: '',
            companyId: '',
            endDate: '',
        })

        let timestamp = ref();
        let time = ref('');
        let timer;
        const store = useStore();
        let sortBy = ref("id");
        let desc = ref(false);
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let companyId = ref("");
        let companyName = ref("");
        let startDate = ref("");
        let endDate = ref("");
        let searchDialog = ref(false);
        let searchId = ref("");
        let editDialog = ref(false);

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
            postRequest("/company/select", {
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
                companyName: companyName.value,
                companyId: companyId.value,
                endDate: endDate.value,
                startDate: startDate.value,
            },
                function success(resp) {
                    if (resp.code == '200') {
                        total.value = resp.data.totalElements;
                        lisenceList.value = resp.data.content;
                    } else {
                        message(resp.msg, 'error');
                    }
                }, function error(resp) {
                    message(resp.msg, 'error');
                }
            )
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
        getTime();

        return {
            lisenceList,
            addDialog,
            getMachine,
            companyId,
            companyName,
            form,
            code,
            time,
            searchDialog,
            startDate,
            editDialog,
            endDate,
            timer,
            searchId,
            timestamp,
            store,
            total,
            pageSize,
            current_page,
            select,
            sortChange,
            timestampToTime,
            Delete,
            Edit,
            Search,
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
            postRequest("/company/add", {
                companyId: that.form.companyId,
                companyName: that.form.companyName,
                endDate: that.form.endDate,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.addDialog = false;
                    that.handleEditClose();
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
        edit(company) {
            const that = this;
            that.form.id = company.id;
            that.form.companyId = company.companyId;
            that.form.companyName = company.companyName;
            that.form.endDate = company.endDate;
            that.editDialog = true;
        },
        search() {
            this.companyId = this.searchId.replace(/\n/g, ",");
            this.select()
            this.searchDialog = false;
        },
        handleClose() {
            this.companyId = this.searchId.replace(/\n/g, ",");
        },
        editCompany() {
            const that = this;
            postRequest("/company/edit", {
                id: that.form.id,
                companyId: that.form.companyId,
                companyName: that.form.companyName,
                endDate: that.form.endDate,
            }, function success(resp) {
                if (resp.code == '200') {
                    message('修改成功', 'success');
                    that.editDialog = false;
                    that.select();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message('修改失败', 'error');
            })
        },
        handleEditClose() {
            this.form.id = "";
            this.form.companyName = "";
            this.form.companyId = "";
            this.form.endDate = "";
        }
    },
    created() {
        this.timer = setInterval(() => {
            this.timestamp += 1000;
            this.time = this.timestampToTime(this.timestamp);
        }, 1000)
    },
    beforeRouteLeave() {
        clearInterval(this.timer);
    },

}
</script>

<style scoped></style>