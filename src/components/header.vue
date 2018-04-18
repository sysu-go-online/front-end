<template>
    <div id="header">
        <p id="name">在线编辑器</h1>
        <div id="headImg"></div>
        <p id="select">
            <select v-model='selected' @click="ss()">
                <option v-for="(option,index) in options" v-bind:value="option.value">
                    {{option.text}}
                </option>
            </select>
        </p>
    </div>
</template>

<script>
export default {
    name: 'Header',
    data() {
        return {
            selected: '0',   // 默认选中
            options: [
                {text: 'UserName', value: '0'},
                {text: 'Others', value: '1'},
                {text: 'Quit', value: '2'}
            ]
        }
    },
    methods: {
        ss: function () {
            // Todo
        },
    }
}
</script>

<style>
#header{
    position: relative;
    height: 35px;
    width: 100%;
    box-sizing: border-box;
}

#name {
    position: absolute;
    margin: 0;
    padding: 5px 20px 5px 20px;
    font-size: 16px;
    color: #009A61;
    box-sizing: border-box;
    display: inline-block;
}

#headImg, #select{
    margin: 5px 0 3px 0;
    position: absolute;
    display: inline-block;
}
#headImg{
    right: 100px;
    width: 24px;
    height: 24px;
    border:1px solid #aaa;
    border-radius: 12px;
    background-color: #ddd;
}
#select{
    right: 20px;
    top: 5px;
    font-size: 10px;
}
</style>
