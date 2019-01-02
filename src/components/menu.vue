<template>
    <div id = "menu-bar">
      <Dropdown trigger="click" @on-click="handleFileClick">
        <Button type="text" ghost>文件</Button>
        <DropdownMenu slot="list">
            <DropdownItem name="addFile">新建文件</DropdownItem>
            <DropdownItem name="addFolder">新建文件夹</DropdownItem>
            <DropdownItem name="save">保存</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown trigger="click">
        <Button type="text" ghost disabled>编辑</Button>
        <DropdownMenu slot="list">
            <DropdownItem>撤销</DropdownItem>
            <DropdownItem>恢复</DropdownItem>
            <DropdownItem>删除</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown trigger="click">
        <Button type="text" ghost disabled>调试</Button>
        <DropdownMenu slot="list">
            <DropdownItem>编译</DropdownItem>
            <DropdownItem>运行</DropdownItem>
            <DropdownItem>停止调试</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown trigger="click">
        <Button type="text" ghost disabled>帮助</Button>
        <DropdownMenu slot="list">
            <DropdownItem>更多帮助</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Button id="backButton" type="text" ghost><router-link to="/profile/project">返回</router-link></Button>
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
    handleFileClick: function (val) {
      if (val === 'addFile') {
        console.log('add file');
        eventBus.$emit('addFile');
      } else if (val === 'addFolder') {
        console.log('add folder');
        eventBus.$emit('addFolder');
      } else if (val === 'save') {
        console.log('save');
        eventBus.$emit('callSaveFromMenu');
      } else {
        console.log('name error');
      }
    }
  }
};
</script>
<style>
#backButton{
  float: right;
  font-size: 14px;
}
#backButton a{
  color: white;
}
</style>
