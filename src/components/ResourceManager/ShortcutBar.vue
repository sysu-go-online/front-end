<template>
  <div id='shortcutBar' @mouseover.stop='showShortcut = true' @mouseout.stop='showShortcut = false'>
    <span id='projectName'>{{ projectName }}</span>
    <span id='shortcut' v-show='this.showShortcut'>
      <tooltip content='新建文件' placement='bottom-start'><Icon custom='iconfont icon-newfile' size=15 @click.stop='addFile' /></tooltip>
      <tooltip content='新建文件夹' placement='bottom'><Icon custom='iconfont icon-create-new-folder' size=20 @click.stop='addFolder' /></tooltip>
      <tooltip content='同步文件树' placement='bottom-end'><Icon type='md-refresh' size=21 @click.stop='syncTree' /></tooltip>
    </span>
  </div>
</template>

<script>
import eventBus from '../../util/eventBus.js';
export default {
  name: 'ShortcutBar',
  data () {
    return {
      projectName: '',
      showShortcut: true
    };
  },
  methods: {
    addFile: function () {
      console.log('addFile');
      eventBus.$emit('addFile');
    },
    addFolder: function () {
      console.log('addFolder');
      eventBus.$emit('addFolder');
    },
    syncTree: function () {
      console.log('syncTree');
      eventBus.$emit('syncTree');
    }
  },
  created () {
    this.projectName = this.$route.params.projectname;
  }
};
</script>

<style>
#shortcutBar {
  height: 100%;
  width: 100%;
  padding: 2px 10px;
}
#shortcutBar:hover {
  cursor: pointer;
}
#projectName, #shortcut {
  height: 100%;
}
#projectName {
  width: 30%;
  left: 0px;
  font-size: 15px;
}
#shortcut {
  float: right;
}
#shortcut i {
  margin: auto 5px;
}
</style>
