<template>
    <div id = "menu-bar">
        <mu-menu placement="bottom-start" >
          <mu-button color="black">文件</mu-button>
          <mu-list slot="content">
            <mu-list-item button @click="addFile">
              <mu-list-item-title>新建文件</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="addFolder">
              <mu-list-item-title>新建文件夹</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="Save">
              <mu-list-item-title>保存</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title>另存为</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
        <mu-menu placement="bottom-start" >
          <mu-button color="black">编辑</mu-button>
          <mu-list slot="content">
            <mu-list-item button>
              <mu-list-item-title>撤销</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title>恢复</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title>删除</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
        <mu-menu placement="bottom-start" >
          <mu-button color="black">调试</mu-button>
          <mu-list slot="content">
            <mu-list-item button>
              <mu-list-item-title>编译</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title>运行</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title>编译并运行</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
        <mu-menu placement="bottom-start" >
          <mu-button color="black">帮助</mu-button>
          <mu-list slot="content">
            <mu-list-item button>
              <mu-list-item-title>？</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
    </div>
</template>

<script>
import eventBus from '../util/eventBus.js';

export default {
  name: 'menu-bar',
  data () {
    return {

    };
  },
  methods: {
    addFile: function () {
      console.log('add file');
      eventBus.$emit('callNewFileFromMenu');
    },
    addFolder: function () {
      console.log('add folder');
      eventBus.$emit('callNewFolderFromMenu');
    },
    Save: function () {
      eventBus.$emit('callSaveFromMenu');
    }
  }
};
</script>
<style>
#menu-bar{
  height: 50px;
  width: 100%;
  box-sizing: border-box;
}
</style>
