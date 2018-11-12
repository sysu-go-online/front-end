<template>
    <div id = "menu">        
        <mu-menu placement="bottom-start" >
          <mu-button color="black">文件</mu-button>
          <mu-list slot="content">
            <mu-list-item button>
              <mu-list-item-title @click='addFlie'>新建文件</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title @click='addFolder'>新建文件夹</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button>
              <mu-list-item-title @click='Save'>保存</mu-list-item-title>
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
import evenBus from '../util/eventBus';


export default {
  name: 'menu',
  data () {
    return {
        //
    };
  },
  methods: {
    addfile: function () {
        eventBus.$emit('callNewFileFromMenu');
    },
    addFolder: function (){
        eventBus.$emit('callNewFolderFromMenu');
    },
    Save: function (){
        eventBus.$emit('callSaveFromMenu');
    }
    
  }
};
</script>  

<style>
#menu{
  height: 50px;
  width: 100%;
  box-sizing: border-box;
}
</style>
