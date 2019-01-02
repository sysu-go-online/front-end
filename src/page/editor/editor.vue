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
              <editor v-show="showEditor"></editor>
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
</template>
<script>
import Editor from '../../components/editor';
import Shell from '../../components/shell';
import Menubar from '../../components/menu';
import ResourceManager from '../../components/ResourceManager/ResourceManager.vue';
import eventBus from '../../util/eventBus.js';

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
      // 目录树宽度
      splitLeftRight: '200px',
      // 代码编辑器状态
      showEditor: false,
      shellHeight: '200px',
      mouseState: 'up',
      subdomain: '',
      hideShell: false
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
      this.showEditor = false;
    },
    openEditor: function () {
      this.showEditor = true;
    }
  },
  created () {
    eventBus.$on('openEditor', this.openEditor);
    eventBus.$on('closeEditor', this.closeEditor);
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
  background-color: #282C34;
}
.ivu-split-trigger-vertical {
  background-color: #282C34 !important;
  border: 1px solid #181A1F !important;
  border-left: none !important;
}
.ivu-layout-header {
  line-height: 35px !important;
}
</style>
