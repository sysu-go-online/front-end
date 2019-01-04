<template>
  <div id="menubar">
    <Dropdown placement="bottom-start" trigger="click" @on-click="handleFileClick">
      <Button class='optionButton' type="text" ghost>文件</Button>
      <DropdownMenu class='optionMenu' slot="list">
        <DropdownItem name="addFile">新建文件</DropdownItem>
        <DropdownItem name="addFolder">新建文件夹</DropdownItem>
        <DropdownItem name="save">保存</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Dropdown placement="bottom-start" trigger="click">
      <Button class='optionButton' type="text" ghost>编辑</Button>
      <DropdownMenu class='optionMenu' slot="list">
        <DropdownItem disabled>撤销</DropdownItem>
        <DropdownItem disabled>恢复</DropdownItem>
        <DropdownItem disabled>删除</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Dropdown placement="bottom-start" trigger="click">
      <Button class='optionButton' type="text" ghost>调试</Button>
      <DropdownMenu class='optionMenu' slot="list">
        <DropdownItem disabled>编译</DropdownItem>
        <DropdownItem disabled>运行</DropdownItem>
        <DropdownItem disabled>停止调试</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Dropdown placement="bottom-start" trigger="click">
      <Button class='optionButton' type="text" ghost>帮助</Button>
      <DropdownMenu class='optionMenu' slot="list">
        <DropdownItem>更多帮助</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Button id="backButton" class="optionButton" type="text" ghost><router-link to="/profile/project">返回</router-link></Button>
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
#menubar {
  background-color: #282C34;
  color: #9DA5B4;
}
.optionButton {
  color: #9DA5B4;
}
.optionButton:focus {
  outline: 0;
}
.optionButton:hover {
  color: #9DA5B4 !important;
  background-color: #3E4249 !important;
}
#menubar .ivu-select-dropdown {
  background-color: #21252B;
  border-top: none;
  border-right: 1px inset #000;
  border-left: 1px inset #000;
  border-bottom: 1px outset #000;
}
.optionMenu {
  background-color: #21252B;
}
.optionMenu .ivu-dropdown-item {
  color: #ADADAD;
}
.optionMenu .ivu-dropdown-item:hover {
  background-color: #2C313A;
}
#backButton {
  float: right;
  font-size: 14px;
}
#backButton a {
  color: #9DA5B4;
}
</style>
