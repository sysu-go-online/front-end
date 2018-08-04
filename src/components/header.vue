<template>
  <div id="header">
    <p id="name">在线编辑器</p>
    <div class="user-info f-right">
      <div id="headImg"></div>
      <div id="select">
        <select v-model='selected' @click="ss()">
          <option v-for="option in options" v-bind:value="option.value" v-bind:key="option.value">
              {{option.text}}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      selected: '0', // 默认选中
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
select {
  /*Chrome和Firefox里面的边框是不一样的，所以复写了一下*/
  border: solid 1px #aaa;
  border-radius: 4px;
  /*将默认的select选择框样式清除*/
  appearance:none;
  -moz-appearance:none;
  -webkit-appearance:none;
  /*在选择框的最右侧中间显示小箭头图片*/
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPYxgFgw2sXr3ac9WqVX+B+D8O/BekBqocO1i5cmUDFo1gDJKDKsMN6uvrmYAKt2PRvB0kB1WGHwAVCwE13Ucy4D5IDCpNHFixYoURUON3EAaxocKkAaCtSSAM5Y4CrICBAQChOmZ5ggRKYQAAAABJRU5ErkJggg==") no-repeat scroll right center transparent;
  /*为下拉小箭头留出一点位置，避免被文字覆盖*/
  padding-top: 2px;
  padding-right: 18px;
  padding-bottom: 2px;
  padding-left: 4px;
}
/*清除ie的默认选择框样式清除，隐藏下拉箭头*/
select::-ms-expand {
  display: none;
}

#header {
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
  display: inline-block;
}
#headImg {
  width: 24px;
  height: 24px;
  margin-right: 5px;
  border:1px solid #aaa;
  border-radius: 12px;
  background-color: #ddd;
}
#select {
  font-size: 10px;
  vertical-align: top;
  select {
    height: 24px;;
  }
}
.user-info {
  margin-right: 20px;
  height: 35px;
}
</style>
