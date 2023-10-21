<template>
    <div class="row" style="margin-top:30px; width: 100%;">
        <div class="col-2"></div>
        <div class="col-8">
            <div class="card">
                <div class="card-header text-center">
                    <span>视频预览</span>
                </div>
                <div class="card-body">
                    <videoPlay id="videoPlayer" v-bind="options" @play="onPlay" @pause="onPause">
                        <h1>暂不支持video标签</h1>
                    </videoPlay>
                </div>
                <el-slider range :max="100" @input="changeProcess" />
                <el-button type="success" @click="submit">确认导出</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import "video.js/dist/video-js.css";
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import 'vue3-video-play/dist/style.css'
import { videoPlay } from 'vue3-video-play'
import { flask, videoRequest, flaskVideoRequest } from '@/utils/http'
import { message } from '@/utils/messageBox';

export default {
    components: {
        videoPlay,
    },
    setup() {
        const value = ref([0, 100]);
        const route = useRoute();
        let path = flask + "/videoCache/" + route.params.time + "/" + route.params.id + ".mp4";
        const options = reactive({
            width: "100%", //播放器高度
            height: "100", //播放器高度
            color: "#409eff", //主题色
            muted: false, //静音
            webFullScreen: false,
            src: path,
            speedRate: ["0.5", "1.0", "1.25", "1.5", "2.0"], //播放倍速
            autoPlay: true, //自动播放
            loop: false, //循环播放
            mirror: false, //镜像画面
            ligthOff: false, //关灯模式
            volume: 1, //默认音量大小
            control: true, //是否显示控制
            controlBtns: [
                "audioTrack",
                "quality",
                "speedRate",
                "volume",
                "setting",
                "pip",
                "pageFullScreen",
                "fullScreen",
            ], //显示所有按钮,
        });
        const onPlay = () => {
            console.log('播放')
        }
        const onPause = () => {
            console.log('暂停')
        }


        return {
            options,
            onPlay,
            onPause,
            value,
            route,
        }

    },
    methods: {
        change(val) {
            if (document.getElementById('videoPlayer')) {
                let videoPlayer = document.getElementById('videoPlayer');
                let videoLength = videoPlayer.duration;
                videoPlayer.currentTime = videoLength / 100 * val;
                // videoPlayer.pause();
            }
        },
        changeProcess(val) {
            console.log(val);
            if (val[0] == this.value[0]) {
                this.change(val[1]);
            } else {
                this.change(val[0]);
            }
            this.value = val;
        },
        submit() {
            const that = this;
            videoRequest("/video/renderByVideoProcess", {
                id: that.route.params.id,
                process1: that.value[0],
                process2: that.value[1],
            }, function success(resp) {
                if (resp.code == '200') {
                    message(resp.msg, 'success');
                    flaskVideoRequest("/renderByVideoId", {
                        videos: [resp.data],
                    }, function success(resp) {
                        console.log(resp);
                    })
                } else {
                    message(resp.msg, 'error');
                }
            }, function error(resp) {
                message(resp.msg, 'error');
            })
        },
    }
}
</script>

<style scoped></style>