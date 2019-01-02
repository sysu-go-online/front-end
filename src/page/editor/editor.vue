<template>
  <!-- <div class="layout" id="home"> -->
    <layout id="editor">
      <i-header id='top'>
        <menubar id='menubar'></menubar>
      </i-header>
      <layout id='main'>
        <split v-model='splitLeftRight' min=200 max=600>
          <layout slot='left' id='mainLeft'>
            <resource-manager></resource-manager>
          </layout>
          <layout slot='right' id='mainRight'>
            <i-content id='mainRightTop'>
              <editor></editor>
            </i-content>
            <i-footer>
              <div class='shell-section' v-bind:class="{'shell-hide': hideShell}">
                <shell class='shell-section-shell' @dbname="resolveDbname"></shell>
                <!--
                <div class="shell-section-info">
                  <div>二级域名：<a target="_blank" :href="subdomain">{{this.subdomain}}</a></div>
                </div>
                -->
              </div>
            </i-footer>
          </layout>
        </split>
      </layout>
    </layout>
    <!--
    <div id="main">
      <div id="menu">
        <div class="menu-icon"><svg class="icon icon-file" @click="showProjectView"><use xlink:href="#icon-file"></use></svg></div>
        <div class="menu-icon"><svg class="icon icon-terminal" @click="showShell"><use xlink:href="#icon-terminal"></use></svg></div>
      </div>
      <div id="main_function">
        <div id="file_tree" v-bind:class="{'project-view-hide': hideProjectView}">
          <project-view @openEditor="openEditorWindow" ref="projectView"></project-view>
        </div>
        <div id="command_line" v-bind:class="{'project-view-hide': hideProjectView}">
          <editor v-if="openEditor" @nofileopen="closeEditor" ref='editor'></editor>
          <div class="shell-section" v-bind:class="{'shell-hide': hideShell}">
            <shell class="shell-section-shell" @dbname="resolveDbname"></shell>
              // 注释掉
            <div class="shell-section-info">
              <div>二级域名：<a target="_blank" :href="subdomain">{{this.subdomain}}</a></div>
            </div>
            // 注释掉
          </div>
        </div>
      </div>
    </div>
  </div>
  -->
</template>
<script>
import Editor from '../../components/editor';
// import Header from '../../components/header';
import Shell from '../../components/shell';
// import Hint from '../../components/hint';
// import Projectview from '../../components/projectview';
import Menubar from '../../components/menu';
import ResourceManager from '../../components/ResourceManager/ResourceManager.vue';

export default {
  name: 'Editor',
  components: {
    editor: Editor,
    shell: Shell,
    menubar: Menubar,
    'resource-manager': ResourceManager
  },
  data () {
    return {
      splitLeftRight: '200px',
      // ---------------------
      shellHeight: '200px',
      mouseState: 'up',
      subdomain: '',
      hideProjectView: false,
      hideShell: false,
      openEditor: true
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
    },
    openEditorWindow: function () {
      this.openEditor = true;
    }
  }
};

</script>

<style lang="scss">
/*-------------------reconstruct-----------*/
#editor {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
#main, #mainLeft, #mainRight {
  height: 100%;
  width: 100%;
}
#mainRight {
  position: relative;
  left: 6px;
}
#mainRightTop {
  position: relative;
}
.ivu-split-trigger-vertical {
  background-color: #282C34 !important;
  border: 1px solid #181A1F !important;
  border-left: none !important;
}
.ivu-layout-header {
  line-height: 35px !important;
}
/*-------------导航菜单样式---------------- */
// #bar {
//   height: 35px;
//   width: 100%;
//   background: black;
// }
// #menu {
//     position: absolute;
//     left: 0;
//     height: 100%;
//     width: 50px;
//     background: #000;
//     box-sizing: border-box;
//     overflow-y: hidden;
//     overflow-x: hidden;
//     display: inline-block;
// }
// .menu-icon {
//   color:#009A61;
//   padding: 10px;
// }
// .icon-file, .icon-terminal {
//   width: 32px !important;
//   height: 32px !important;
// }

// #main {
//     position: relative;
//     width: 100%;
//     height: calc(100% - 35px);
//     background-color: black;
// }
// .icon {
//   display: inline-block;
//   width: 12px;
//   height: 12px;
//   stroke-width: 0;
//   stroke: currentColor;
//   fill: currentColor;
// }
// /* --------------------------可拖动工作区设置------------------------------------*/
// #main_function {
//   position: absolute;
//   background-color: #292929;
//   width: calc(100% - 50px);
//   height: 100%;
//   overflow: hidden;
//   left: 50px;
// }
// #file_tree {
//   position: absolute;
//   margin: 0;
//   height: 100%;
//   background-color:  #292929;
//   transition: transform 0.35s;
//   width: 200px;
// }
// #command_line {
//   position: absolute;
//   height: 100%;
//   box-sizing: border-box;
//   background: #1e1e1e;
//   transition: transform 0.35s;
//   left: 200px;
//   width: calc(100% - 200px);
// }
// .col-resize {
//   cursor: col-resize;
// }
// .row-resize {
//   cursor: row-resize;
// }
// .shell-section {
//   width: 100%;
//   position: absolute;
//   bottom: 0;
//   height: 200px;
//   /*
//   .shell-section-info {
//     width: 195px;
//     display: inline-block;
//     height: 200px;
//     background: #1e1e1e;
//     vertical-align: top;
//     color: white;
//   }
//   */
//   .shell-section-shell {
//     width: 100% !important;
//     height: 100%;
//     display: inline-block;
//   }
// }
// /*
// .shell-section-shell {
//   width: calc(100% - 200px) !important;
//   display: inline-block;
// }*/
// #file_tree.project-view-hide {
//   transform: translate(-200px,0px);
// }
// #command_line.project-view-hide {
//   transform: translate(-200px,0px);
//   width: 100%;
// }
// #command_line.shell-hide {

// }
// .shell-section.shell-hide {
//   display: none;
// }

// /*-------------右键弹窗样式---------------- */
// a {
//   color: #333;
// }

</style>
