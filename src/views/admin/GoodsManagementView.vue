<template>
    <div class="row" style="width:100%; margin-top:30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>订单管理</h3>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="startTime" type="datetime" placeholder="开始时间"
                                value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索工位名称" v-model="stationName" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索工号" v-model="uid" />

                        </el-col>

                    </el-row>
                    <el-row class="mt-2" :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="endTime" type="datetime" placeholder="结束时间"
                                value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索订单(英文逗号分割批量搜索)" v-model="id">
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
                    <el-table style="width: 100%" height="540" :data="goodsList" @sort-change="sortChange"
                        ref="multiple" @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="55" :selectable="selectable" />
                        <el-table-column label="序号">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="goodsId" label="订单编号" sortable="costom" />
                        <el-table-column prop="scanTime" label="扫描时间" sortable="costom" />
                        <el-table-column prop="station['stationName']" label="工位名称" />
                        <el-table-column align="right" width="300">
                            <template #header>
                                <el-button type="danger" round @click="deleteAll" :disabled="allDisable">
                                    批量删除
                                </el-button>
                                <el-button type="primary" round @click="renderAll" :disabled="allDisable">
                                    批量导出
                                </el-button>
                            </template>
                            <template #default="scope">
                                <el-button type="danger" @click="deleteGoods(scope.row.id)" :disabled="btnDisabled">订单删除
                                </el-button>
                                <el-button type="primary" @click="render(scope.row.id)" :disabled="btnDisabled"
                                    v-if="scope.row.videos.length == 0">开始导出</el-button>
                                <el-button type="success"
                                    @click="getVideoList(scope.row.id, scope.row.videos, scope.$index)" v-else>视频列表
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="card-footer">
                    <el-row justify="center">
                        <el-row justify="center">
                            <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total"
                                :current_page="current_page" :page-sizes="[10, 50, 100]" :page-size="pageSize"
                                @current-change="handleCurrentChange" @size-change="handleSizeChange" />
                        </el-row>
                    </el-row>
                </div>
                <el-dialog v-model="searchDialog" title="批量搜索(每个订单号以回车分割)" width="30%" @close="handleClose">
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
                <el-dialog v-model="videoListDialog" title="视频列表" width="50%">
                    <el-table :data="videoList">
                        <el-table-column prop="startTime" label="开始时间" sortable="costom" />
                        <el-table-column prop="endTime" label="结束时间" sortable="costom" />
                        <el-table-column prop="state" label="视频状态" :formatter="stateFormatter" />
                        <el-table-column align="right">
                            <template #header>
                                <el-button type="primary" circle :icon="Refresh" @click="Fresh(videoId)" />
                            </template>
                            <template #default="scope">
                                <el-link target="_blank" :href="'/video/stream/' + scope.row.id"
                                    :disabled="scope.row.state != 2" :underline="false" style="margin: 0 10px">
                                    <el-button type="success" :disabled="scope.row.state != 2" :icon="Download" circle>
                                    </el-button>
                                </el-link>
                                <el-button type="success" circle :icon="VideoPlay" @click="play(scope.row.id)"
                                    :disabled="scope.row.state != 2" />
                            </template>
                        </el-table-column>
                    </el-table>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="videoListDialog = false">退出</el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
        </div>
    </div>
</template>
<script>

import { postRequest } from '@/utils/http';
import { message } from '@/utils/messageBox';
import { ref } from 'vue';
import { Search, MoreFilled, VideoPlay, Refresh, Download } from '@element-plus/icons-vue'
import router from '@/router/index'

export default {
    setup() {
        let goodsList = ref([]);
        let id = ref('');
        let goodsId = ref('');
        let startTime = ref('');
        let endTime = ref('');
        let uid = ref('');
        let stationName = ref('');
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let sortBy = ref("scanTime");
        let desc = ref(true);
        let searchDialog = ref(false);
        let searchId = ref('')
        let multiple = ref([]);
        let btnDisabled = ref(false);
        let allDisable = ref(true);
        let videoListDialog = ref(false);
        let videoList = ref([]);
        let videoId = ref('');
        let goodsIndex = ref(0);


        const select = () => {
            console.log(sortBy.value)
            postRequest("/goods/select", {
                id: id.value,
                startTime: startTime.value,
                endTime: endTime.value,
                uid: uid.value,
                stationName: stationName.value,
                page: current_page.value,
                size: pageSize.value,
                sortBy: sortBy.value,
                desc: desc.value,
            }, function success(resp) {
                if (resp.code == '200') {
                    goodsList.value = resp.data.content;
                    total.value = resp.data.totalElements;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                message(resp.msg, 'error');
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
            goodsList,
            id,
            startTime,
            endTime,
            uid,
            stationName,
            total,
            current_page,
            pageSize,
            searchDialog,
            searchId,
            multiple,
            btnDisabled,
            allDisable,
            videoList,
            videoListDialog,
            videoId,
            goodsId,
            select,
            sortChange,
            Search,
            MoreFilled,
            VideoPlay,
            Refresh,
            Download,
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
        render(id) {
            const that = this;
            postRequest("/video/renderByIds", {
                ids: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    that.select();
                } else {
                    message(resp.msg, 'error');
                }
            }, function error() {
                message('添加导出队列失败', 'error');
            })
        },
        deleteGoods(id) {
            const that = this;
            postRequest("/goods/delete", {
                ids: id,
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
        handleClose() {
            this.searchId = ''
            this.searchDialog = false;
        },
        search() {
            this.searchId = this.searchId.replace(/\n/g, ",");
            this.id = this.searchId;
            this.select()
            this.searchDialog = false;
        },
        handleSelectionChange(val) {
            const that = this;
            that.multiple.value = val;
            if (that.multiple.value.length != 0) {
                that.btnDisabled = true;
                that.allDisable = false;
            } else {
                that.btnDisabled = false;
                that.allDisable = true;
            }
        },
        renderAll() {
            let multipleArray = [];
            for (let i of this.multiple.value) {
                multipleArray.push(i.id);
            }
            this.render(multipleArray.join());
        },
        deleteAll() {
            let multipleArray = [];
            for (let i of this.multiple.value) {
                multipleArray.push(i.id);
            }
            this.deleteGoods(multipleArray.join());
        },
        getVideoList(id, list, index) {
            this.goodsIndex = index;
            this.videoListDialog = true;
            this.videoId = id;
            this.videoList = list;
        },
        stateFormatter(row, column, cellValue) {
            if (cellValue == 0) {
                return "导出中";
            } else if (cellValue == 1) {
                return "导出中";
            } else if (cellValue == 2) {
                return "导出完成";
            } else if (cellValue == 3) {
                return "导出错误";
            } else if (cellValue == 4) {
                return "导出结果已被删除";
            }
        },
        play(id) {
            // router.push({ name: 'video_view', params: { id: id } });
            let routerUrl = router.resolve({ name: 'video_view', params: { id: id } });
            window.open(routerUrl.href, "_blank");
        },
        Fresh(id) {
            const that = this;
            postRequest("/video/selectByGoodsId", {
                id: id,
            }, function success(resp) {
                if (resp.code == '200') {
                    that.videoList = resp.data;
                    that.goodsList[that.goodsIndex].videos = resp.data;
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                message(resp.msg, 'error');
            })
        },
        selectable(row) {
            if (row.videos.length == 0) {
                return true;
            } else {
                return false;
            }
        }
    },
}
</script>

<style scoped>

</style>