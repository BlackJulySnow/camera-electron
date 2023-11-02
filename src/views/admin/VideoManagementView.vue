<template>
    <div class="row" style="width: 100%; margin-top: 30px">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <h3>视频管理</h3>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="startTime" type="datetime" placeholder="开始时间"
                                value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                        </el-col>
                        <el-col :span="8">
                            <el-input placeholder="搜索工位名称" v-model="stationName" />
                        </el-col>
                        <!-- <el-col :span="8">
                            <el-input placeholder="搜索工号" v-model="uid" />
                        </el-col> -->
                        <el-col :span="8">
                            <el-select placeholder="视频状态" v-model="state" style="width:100%">
                                <el-option v-for="Type in stateType" :key="Type.value" :label="Type.label"
                                    :value="Type.value" />
                            </el-select>
                        </el-col>
                        <!-- <el-col :span="6">
                            <el-button :icon="Search" circle type="primary" @click="select()" />
                        </el-col> -->
                    </el-row>
                    <el-row class="mt-2" :gutter="20">
                        <el-col :span="8">
                            <el-date-picker v-model="endTime" type="datetime" placeholder="结束时间"
                                value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
                    <el-table style="width: 100%" height="540" :data="videoList" @sort-change="sortChange">
                        <el-table-column label="序号" width="100">
                            <template #default="scope">
                                {{ (current_page - 1) * pageSize + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="goods.scanTime" label="扫描时间" width="200" />
                        <el-table-column prop="goods.goodsId" label="单号" />
                        <el-table-column prop="goods.station.stationName" label="扫描工位" />
                        <el-table-column prop="state" label="视频状态" :formatter="stateFormatter" sortable="costom"
                            width="140" />
                        <el-table-column align="right" width="200">
                            <template #default="scope">
                                <el-button type="primary" @click="randerAgain(scope.row)"
                                    v-if="scope.row.state == 5">重新导出</el-button>
                                <el-button type="primary" @click="downloadFromCloud(scope.row)"
                                    v-else-if="scope.row.state == 6">云下载</el-button>
                                <el-popconfirm width="200" confirm-button-text="确认" cancel-button-text="取消"
                                    confirm-button-type="danger" cancel-button-type="info" :hide-after="50" title="确认删除？"
                                    @confirm="handleDelete(scope.row.id)" v-else-if="scope.row.state != 4">
                                    <template #reference>
                                        <el-button type="danger">删除</el-button>
                                    </template>
                                </el-popconfirm>
                                <el-popconfirm width="200" confirm-button-text="确认" cancel-button-text="取消"
                                    confirm-button-type="danger" cancel-button-type="info" :hide-after="50" title="确认彻底删除？"
                                    @confirm="handleDelete(scope.row.id)" v-else-if="scope.row.state == 4">
                                    <template #reference>
                                        <el-button type="danger">彻底删除</el-button>
                                    </template>
                                </el-popconfirm>
                                <el-button type="success" :disabled="scope.row.state != 2 || disabledDownLoad"
                                    :icon="Download" circle @click="
                                        downloadVideo(
                                            scope.row.id,
                                            scope.row.startTime,
                                            scope.row.goods.goodsId
                                        )
                                        "></el-button>
                                <el-button type="success" circle :icon="VideoPlay" @click="play(scope.row)"
                                    :disabled="(scope.row.state != 2)" />
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
            </div>
        </div>
    </div>
    <el-dialog v-model="searchDialog" title="批量搜索(每个订单号以回车分割)" width="30%" @close="handleClose">
        <el-input v-model="searchId" :autosize="{ minRows: 8, maxRows: 16 }" type="textarea" />
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="searchDialog = false">取消</el-button>
                <el-button type="primary" @click="search()"> 搜索 </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script>
import { flaskRequest, postRequest } from "@/utils/http";
import { message } from "@/utils/messageBox";
import { ref } from "vue";
import { Search, VideoPlay, Download } from "@element-plus/icons-vue";
import { stateType } from "@/global";
import router from "@/router/index";
import { ipcRenderer } from "electron";

export default {
    setup() {
        let videoList = ref([]);
        let state = ref(-1);
        let startTime = ref("");
        let endTime = ref("");
        let total = ref(0);
        let current_page = ref(1);
        let pageSize = ref(10);
        let sortBy = ref("createTime");
        let desc = ref(true);
        let playDialog = ref(false);
        let stationName = ref("");
        let searchDialog = ref(false);
        let id = ref("");
        let searchId = ref("");
        let filePath = ref("");
        let disabledDownLoad = ref(false);

        const select = () => {
            flaskRequest(
                "/videoSelect",
                {
                    startTime: startTime.value,
                    endTime: endTime.value,
                    state: state.value,
                    page: current_page.value,
                    size: pageSize.value,
                    sortBy: sortBy.value,
                    desc: desc.value,
                    stationName: stationName.value,
                    goods_ids: id.value,
                },
                function success(resp) {
                    if (resp.code == "200") {
                        videoList.value = resp.data.content;
                        total.value = resp.data.totalElements;
                    } else {
                        message(resp.msg, "error");
                    }
                },
                function error(resp) {
                    message(resp.responseJSON.msg, "error");
                }
            );
        };
        const sortChange = (column) => {
            const prop = column.prop;
            if (prop) {
                if (column.order == "ascending") {
                    desc.value = false;
                    sortBy.value = prop;
                } else if (column.order == "descending") {
                    desc.value = true;
                    sortBy.value = prop;
                } else if (column.order == null) {
                    sortBy.value = "id";
                    desc.value = false;
                }
                select();
            }
        };

        select();

        return {
            videoList,
            startTime,
            endTime,
            total,
            current_page,
            pageSize,
            select,
            sortChange,
            Search,
            filePath,
            state,
            stateType,
            playDialog,
            VideoPlay,
            Download,
            stationName,
            searchDialog,
            disabledDownLoad,
            id,
            searchId,
        };
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
            this.searchDialog = false;
            this.id = this.searchId.replace(/\n/g, ",");
        },
        stateFormatter(row, column, cellValue) {
            for (let i = 0; i < stateType.length; i++) {
                if (cellValue == stateType[i].value) {
                    return stateType[i].label;
                }
            }
            return "错误";
        },
        handleDelete(id) {
            const that = this;
            postRequest(
                "/video/delete",
                {
                    id: id,
                },
                function success(resp) {
                    if (resp.code == "200") {
                        that.select();
                        message(resp.msg, "success");
                        if (resp.data != 0) {
                            flaskRequest(
                                "/deleteVideo",
                                {
                                    video: resp.data,
                                },
                                function success(resp) {
                                    console.log(resp);
                                },
                                function error(resp) {
                                    console.log(resp);
                                }
                            );
                        }
                    } else {
                        message(resp.msg, "error");
                    }
                },
                function error(resp) {
                    // message(resp.msg, 'error');
                    message(resp.responseJSON.msg, "error");
                }
            );
        },
        play(row) {
            // let size = "height=" + window.screen.height + ",width=" + window.screen.width;
            let size =
                "height=" +
                (window.screen.availHeight - 100) +
                ",width=" +
                (window.screen.availWidth - 100) +
                ",autoHideMenuBar=true";
            let routerUrl = router.resolve({
                name: "video_view",
                params: { time: row.startTime.split(" ")[0], id: row.id },
            });
            window.open(routerUrl.href, "_blank", size);
        },
        search() {
            this.id = this.searchId.replace(/\n/g, ",");
            this.select();
            this.searchDialog = false;
        },
        randerAgain(video) {
            // const that = this;
            flaskRequest(
                "/renderAgain",
                {
                    video: video.id,
                    startTime: video.startTime,
                },
                function success(resp) {
                    message(resp.msg, "success");
                    video.state = 1;
                },
                function error() {
                    message("导出错误", "error");
                }
            );
        },
        downloadVideo(id, startTime, goodsId) {
            const that = this;
            that.disabledDownLoad = true;
            const result = ipcRenderer.invoke("dialog:openFile");
            result.then((res) => {
                if (res != "canceled") {
                    flaskRequest(
                        "/fileLoad",
                        {
                            id: id,
                            startTime: startTime,
                            goodsId: goodsId,
                            path: res,
                        },
                        function success(resp) {
                            if (resp.code == 200) {
                                message(resp.msg, "success");
                            } else {
                                message(resp.msg, "warning");
                            }
                            that.select()
                            that.disabledDownLoad = false;
                        },
                        function error(resp) {
                            message(resp.responseJSON.msg, "error");
                            that.disabledDownLoad = false;
                        }
                    );
                } else {
                    that.disabledDownLoad = false;
                }
            });
        },
        downloadFromCloud(video) {
            // const that = this;
            flaskRequest("/downloadFromCloud", {
                id: video.id,
                startTime: video.startTime
            }, function success(resp) {
                if (resp.code == 200) {
                    message(resp.msg, "success")
                    video.state = 0;
                } else {
                    message(resp.msg, "warning");
                }
            }, function error() {
                message("请求错误", "error");
            })
            console.log(video);
        }
    },
};
</script>

<style scoped>
.card /deep/ .el-dialog {
    height: 70%;
}

video {
    height: 100%;
    width: 100%;
    object-fit: cover;
}
</style>
