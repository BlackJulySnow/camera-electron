<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <el-card>
                <p>当前系统时间：{{ time }}</p>
                <p>过期时间：{{ expireTime }}</p>
            </el-card>
            <el-tabs v-model="activeName" type="border-card" class="demo-tabs mt-4" v-if="store.state.user.company.id == 1"
                @tab-change="handleClick">
                <el-tab-pane label="公司授权管理" name="first">
                    <div class="card" v-if="store.state.user.company.id == 1">
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
                                <el-col :span="8">
                                    <el-input placeholder="搜索会员等级" v-model="vipLevel" />
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
                                <el-table-column prop="vip.name" label="会员等级" sortable="costom" />
                                <el-table-column width="150" align="right">
                                    <template #header>
                                        <el-button type="primary" plain @click="addDialog = true">新增</el-button>
                                    </template>
                                    <template #default="scope">
                                        <el-button type="primary" :icon="Edit" circle @click="edit(scope.row)" />
                                        <el-button type="danger" :icon="Delete" circle
                                            @click="handleDelete(scope.row.id)" />
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
                                    <el-date-picker v-model="form.endDate" type="datetime"
                                        value-format="YYYY-MM-DD HH:mm:ss" />
                                </el-form-item>
                                <el-form-item label="会员等级">
                                    <el-select v-model="form.vipSelect" class="m-2" placeholder="Select">
                                        <el-option v-for="vip in vipList" :key="vip.id" :label="vip.name" :value="vip.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="会员过期时间">
                                    <el-date-picker v-model="form.expiresDate" type="datetime"
                                        value-format="YYYY-MM-DD HH:mm:ss" />
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
                </el-tab-pane>
                <el-tab-pane label="会员管理" name="second">
                    <div class="card" v-if="store.state.user.company.id == 1">
                        <div class="card-header text-center">
                            <h3>会员管理</h3>
                        </div>
                        <div class="card-body">
                            <el-table :data="vipList" style="width: 100%" height="540" @sort-change="sortChange">
                                <el-table-column label="序号">
                                    <template #default="scope">
                                        {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" label="会员制名称" sortable="costom" />
                                <el-table-column prop="stationNum" label="授权工位数量" sortable="costom"
                                    :formatter="numFormatter" />
                                <el-table-column prop="renderNum" label="普通导出数量" sortable="costom"
                                    :formatter="numFormatter" />
                                <el-table-column prop="findNum" label="查询次数" sortable="costom" :formatter="numFormatter" />
                                <el-table-column prop="watermarkRenderNum" label="水印导出数量" sortable="costom"
                                    :formatter="numFormatter" />
                                <el-table-column width="200" align="right">
                                    <template #header>
                                        <el-button type="primary" plain @click="addVipDialog = true">新增</el-button>
                                    </template>
                                    <template #default="scope">
                                        <el-button type="primary" :icon="Edit" circle @click="editVip(scope.row)" />
                                        <el-button type="danger" :icon="Delete" circle @click="deleteVip(scope.row.id)" />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <el-dialog v-model="editVipDialog" title="编辑(-1为无限次)" width="30%" @close="handleEditClose">
                            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                                <el-form-item label="编号">
                                    <el-input v-model="form.id" disabled />
                                </el-form-item>
                                <el-form-item label="会员制名称">
                                    <el-input v-model="form.name" />
                                </el-form-item>
                                <el-form-item label="授权工位数量">
                                    <el-input type="number" v-model="form.stationNum" />
                                </el-form-item>
                                <el-form-item label="普通渲染数量">
                                    <el-input type="number" v-model="form.renderNum" />
                                </el-form-item>
                                <el-form-item label="查询次数">
                                    <el-input type="number" v-model="form.findNum" />
                                </el-form-item>
                                <el-form-item label="水印渲染数量">
                                    <el-input type="number" v-model="form.watermarkRenderNum" />
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button @click="editVipDialog = false">取消</el-button>
                                    <el-button type="primary" @click="editVipS()">
                                        修改
                                    </el-button>
                                </span>
                            </template>
                        </el-dialog>
                        <div class="card-footer">
                            <el-row justify="center">
                                <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="totalVip"
                                    :current_page="current_pageVip" :page-sizes="[10, 50, 100]" :page-size="pageSizeVip"
                                    @current-change="handleVipCurrentChange" @size-change="handleVipSizeChange" />
                            </el-row>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
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
                <el-form-item label="会员等级">
                    <el-select v-model="form.vipSelect" class="m-2" placeholder="Select">
                        <el-option v-for="vip in vipList" :key="vip.id" :label="vip.name" :value="vip.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="会员过期时间">
                    <el-date-picker v-model="form.expiresDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
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
        <el-dialog v-model="addVipDialog" title="新增(-1为无限次)" width="30%">
            <el-form label-position="right" label-width="100px" :model="form" style="max-width: 460px">
                <el-form-item label="会员制名称">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="授权工位数量">
                    <el-input type="number" v-model="form.stationNum" />
                </el-form-item>
                <el-form-item label="普通渲染数量">
                    <el-input type="number" v-model="form.renderNum" />
                </el-form-item>
                <el-form-item label="查询次数">
                    <el-input type="number" v-model="form.findNum" />
                </el-form-item>
                <el-form-item label="水印渲染数量">
                    <el-input type="number" v-model="form.watermarkRenderNum" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addVipDialog = false">取消</el-button>
                    <el-button type="primary" @click="addVip()">
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
            vipSelect: '',
            name: '',
            stationNum: '',
            renderNum: '',
            findNum: '',
            watermarkRenderNum: '',
            expiresDate: '',
        })

        let editVipDialog = ref(false);
        let timestamp = ref();
        let time = ref('');
        let timer;
        const store = useStore();
        let sortBy = ref("id");
        let sortByVip = ref("id");
        let desc = ref(false);
        let descVip = ref(false);
        let total = ref(0);
        let totalVip = ref(0);
        let current_page = ref(1);
        let current_pageVip = ref(1);
        let pageSize = ref(10);
        let pageSizeVip = ref(10);
        let companyId = ref("");
        let companyName = ref("");
        let startDate = ref("");
        let endDate = ref("");
        let searchDialog = ref(false);
        let searchId = ref("");
        let editDialog = ref(false);
        let vipList = ref([])
        let vipLevel = ref('');
        let addVipDialog = ref(false);
        const activeName = ref('first');
        let expireTime = ref('');

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
                vipName: vipLevel.value,
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

        const getExpire = () => {
            postRequest("/company/getExpired", {
            }, function success(resp) {
                if (resp.code == '200') {
                    expireTime.value = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                message(resp.msg, 'error');
            }
            )
        }

        const selectVip = () => {
            postRequest("/vip/select", {
                page: current_pageVip.value,
                size: pageSizeVip.value,
                sortBy: sortByVip.value,
                desc: descVip.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    totalVip.value = resp.data.totalElements;
                    vipList.value = resp.data.content;
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
        selectVip();
        getTime();
        getExpire();

        return {
            lisenceList,
            addDialog,
            editVipDialog,
            vipLevel,
            getMachine,
            companyId,
            companyName,
            addVipDialog,
            totalVip,
            form,
            code,
            time,
            searchDialog,
            startDate,
            editDialog,
            expireTime,
            endDate,
            timer,
            searchId,
            timestamp,
            current_pageVip,
            pageSizeVip,
            store,
            vipList,
            total,
            pageSize,
            current_page,
            select,
            selectVip,
            sortChange,
            timestampToTime,
            Delete,
            Edit,
            Search,
            activeName
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
        handleVipSizeChange(size) {
            this.pageSizeVip = size;
            this.selectVip();
        },
        handleVipCurrentChange(currentPage) {
            this.current_pageVip = currentPage;
            this.selectVip();
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
                vipSelect: that.form.vipSelect,
                expiresDate: that.form.expiresDate,
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
        addVip() {
            const that = this;
            postRequest("/vip/add", {
                name: that.form.name,
                stationNum: that.form.stationNum,
                renderNum: that.form.renderNum,
                findNum: that.form.findNum,
                watermarkRenderNum: that.form.watermarkRenderNum,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.addVipDialog = false;
                    that.handleEditClose();
                    that.selectVip();
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
            that.form.vipSelect = company.vip.id;
            that.form.expiresDate = company.expiresDate;
            that.editDialog = true;
        },
        editVip(vip) {
            const that = this;
            that.form.id = vip.id;
            that.form.name = vip.name;
            that.form.stationNum = vip.stationNum;
            that.form.renderNum = vip.renderNum;
            that.form.findNum = vip.findNum;
            that.form.watermarkRenderNum = vip.watermarkRenderNum;
            that.editVipDialog = true;
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
                vipSelect: that.form.vipSelect,
                expiresDate: that.form.expiresDate,
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
        editVipS() {
            const that = this;
            postRequest("/vip/edit", {
                id: that.form.id,
                name: that.form.name,
                stationNum: that.form.stationNum,
                renderNum: that.form.renderNum,
                findNum: that.form.findNum,
                watermarkRenderNum: that.form.watermarkRenderNum,
            }, function success(resp) {
                if (resp.code == '200') {
                    message('修改成功', 'success');
                    that.editVipDialog = false;
                    that.selectVip();
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
            this.form.name = "";
            this.form.stationNum = '';
            this.form.renderNum = '';
            this.form.findNum = '';
            this.form.watermarkRenderNum = '';
            this.form.expiresDate = '';
        },
        handleClick() {
            console.log(this.activeName);
            if (this.activeName == 'first') {
                this.select();
            } else {
                this.selectVip();
            }
        },
        numFormatter(row, col, cellValue) {
            if (cellValue == -1) {
                return "无限次";
            } else {
                return cellValue;
            }
        },
        deleteVip(id) {
            const that = this;
            postRequest("/vip/delete", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.selectVip();
                } else {
                    message(resp.msg, 'warning');
                }
            }, function error() {
                message("删除失败", 'error');
            })
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