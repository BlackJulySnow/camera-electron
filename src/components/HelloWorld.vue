<template>
  <el-row class="mb-4">
    <el-button>Default</el-button>
    <el-button type="primary">Primary</el-button>
    <el-button type="success">Success</el-button>
    <el-button type="info">Info</el-button>
    <el-button type="warning">Warning</el-button>
    <el-button type="danger">Danger</el-button>
  </el-row>
  <div class="hello">
    <button type="button" @click="test">test</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods:{
    test(){
      this.axios.get("http://127.0.0.1/api/v1/third/dataReceive")
      .then((res) => {
        console.log(res.data);
        console.log(this.axios)
      })
    }
  }
}
</script>