<template>
  <div id="home">
    <heads></heads>
    <div id="main">
      <div id="menu">
        <div class="menu-icon"><svg class="icon icon-file" @click="showProjectView"><use xlink:href="#icon-file"></use></svg></div>
        <div class="menu-icon"><svg class="icon icon-terminal" @click="showShell"><use xlink:href="#icon-terminal"></use></svg></div>
      </div>
      <div id="main_function">
        <div id="file_tree" v-bind:class="{'project-view-hide': hideProjectView}">
          <project-view @openfile="openFile" @deleteFile="deleteFile" @renameFile="renameFile" v-model="this.currentFile" ref="projectView"></project-view>
        </div>
        <div id="command_line" v-bind:class="{'project-view-hide': hideProjectView}">
          <editor v-if="openEditor" :projectName="this.projectName" :currentFile="this.currentFile" :toDeleteFileId="this.toDeleteFileId" :toRenameFile="this.toRenameFile" @openfile="openFile" @closeFile="closeFile" @nofileopen="closeEditor" ref='editor'></editor>
          <div class="shell-section" v-bind:class="{'shell-hide': hideShell}">
            <shell class="shell-section-shell" @dbname="resolveDbname"></shell>
            <div class="shell-section-info">
              <div>二级域名：<a target="_blank" :href="subdomain">{{this.subdomain}}</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Editor from '../../components/editor';
import Header from '../../components/header';
import Shell from '../../components/shell';
import Hint from '../../components/hint';
import Projectview from '../../components/projectview';

export default {
  name: 'Editor',
  components: {
    editor: Editor,
    heads: Header,
    shell: Shell,
    hint: Hint,
    'project-view': Projectview
  },
  data () {
    return {
      shellHeight: '200px',
      projectName: '',
      currentFile: {},
      openFileIds: [],
      toDeleteFileId: null,
      toRenameFile: {},
      mouseState: 'up',
      subdomain: '',
      hideProjectView: false,
      hideShell: false,
      openEditor: false
    };
  },
  methods: {
    resolveDbname: function (dbname) {
      this.subdomain = 'http://' + dbname;
    },
    showProjectView: function () {
      this.hideProjectView = !this.hideProjectView;
      this.$nextTick(() => {
        this.$refs.editor.$refs.editor.getMonaco().layout();
      });
    },
    showShell: function () {
      this.hideShell = !this.hideShell;
    },
    closeEditor: function () {
      this.openEditor = false;
      this.currentFile = {};
    },
    // TOFIX: 目录与标签栏高亮同步还有点问题
    openFile: function (data, projectName) {
      if (!this.openEditor) {
        this.openEditor = true;
      }
      this.$nextTick(() => {
        this.currentFile = data;
        // 修改已打开文件的顺序
        var index = this.openFileIds.indexOf(data.id);
        if (index !== -1) {
          this.openFileIds.splice(index, 1);
        }
        this.projectName = projectName;
        this.openFileIds.push(data.id);
      });
    },
    closeFile: function (fileid) {
      this.openFileIds.splice(this.openFileIds.indexOf(fileid), 1);
    },
    deleteFile: function (file) {
      var index = this.openFileIds.indexOf(file.id);
      if (index !== -1) {
        this.openFileIds.splice(index, 1);
        this.toDeleteFileId = file.id;
      }
    },
    renameFile: function (file) {
      var index = this.openFileIds.indexOf(file.id);
      if (index !== -1) {
        this.toRenameFile = file;
      }
    }
  }
};

</script>

<style lang="scss">
#menu {
    position: absolute;
    left: 0;
    height: 100%;
    width: 50px;
    background: #000;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    display: inline-block;
}
.menu-icon {
  color:#009A61;
  padding: 10px;
}
.icon-file, .icon-terminal {
  width: 32px !important;
  height: 32px !important;
}
#home{
  height: 100%;
  width: 100%;
}
#main {
    position: relative;
    width: 100%;
    height: calc(100% - 35px);
    background-color: black;
}
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}
/* --------------------------可拖动工作区设置------------------------------------*/
#main_function {
  position: absolute;
  background-color: #292929;
  width: calc(100% - 50px);
  height: 100%;
  overflow: hidden;
  left: 50px;
}
#file_tree {
  position: absolute;
  margin: 0;
  height: 100%;
  background-color:  #292929;
  transition: transform 0.35s;
  width: 200px;
}
#command_line {
  position: absolute;
  height: 100%;
  box-sizing: border-box;
  background: #1e1e1e;
  transition: transform 0.35s;
  left: 200px;
  width: calc(100% - 200px);
}
.col-resize {
  cursor: col-resize;
}
.row-resize {
  cursor: row-resize;
}
.shell-section {
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 200px;
  .shell-section-info {
    width: 195px;
    display: inline-block;
    height: 200px;
    background: #1e1e1e;
    vertical-align: top;
    color: white;
  }
  .shell-section-shell {
    width: calc(100% - 200px) !important;
    display: inline-block;
  }
}
.shell-section-shell {
  width: calc(100% - 200px) !important;
  display: inline-block;
}
#file_tree.project-view-hide {
  transform: translate(-200px,0px);
}
#command_line.project-view-hide {
  transform: translate(-200px,0px);
  width: 100%;
}
#command_line.shell-hide {

}
.shell-section.shell-hide {
  display: none;
}
#editor {
  height: 100%;
  width: 100%;
}
/*-------------右键弹窗样式---------------- */
a {
  color: #333;
}
</style>
