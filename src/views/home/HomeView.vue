<template>
    <button :on-click="app" type="button"></button>
</template>
<script>
const { spawn } = require('child_process');

export default {
    setup() {
        let templateFilePath = './resources/dist/app/app.exe';

        return {
            templateFilePath
        }
    },
    methods: {
        app() {
            spawn(this.templateFilePath);
        }
    }
}

</script>

<style scoped></style>