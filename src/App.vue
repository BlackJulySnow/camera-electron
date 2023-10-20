<template>
  <NavBar></NavBar>
  <router-view></router-view>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap"
import NavBar from '@/components/NarBar.vue'
import { ipcRenderer } from 'electron'
import { message } from '@/utils/messageBox'
// import { useRoute } from "vue-router"

export default {

  components: {
    NavBar
  },
  setup(){
    ipcRenderer.send("checkForUpdate");
      ipcRenderer.on("message", (event, data) => {
        
        if (data.status == -1) {
          message(data.msg, 'error');
        }else{
          message(data.msg, 'success');
        }
      });
  }

}
</script>
<style></style>
