<template>
  <NavBar></NavBar>
  <router-view></router-view>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap"
import NavBar from '@/components/NarBar.vue'
// import { useRoute } from "vue-router"

export default {
  
  components: {
    NavBar
  },


}
</script>
<style></style>
