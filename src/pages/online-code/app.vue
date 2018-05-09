<template>
  <div id="home">
    <heads></heads>
    <div id="content">
      <div id="menu">
        <div class="menu-icon"><svg class="icon icon-file" @click="showProjectView"><use xlink:href="#icon-file"></use></svg></div>
        <div class="menu-icon"><svg class="icon icon-terminal" @click="showShell"><use xlink:href="#icon-terminal"></use></svg></div>
      </div>
      <project-view @openfile="openFile" v-bind:style="{width: projectViewWidth}"></project-view>
      <div id="command_line" v-bind:style="{left: commandLineLeft, width: commandLineWidth}">
        <editor :fileData="this.fileData" v-bind:style="{height: editorHeight, width: editorWidth}"></editor>
        <shell v-bind:style="{height: shellHeight}"></shell>
      </div>
    </div>
  </div>
</template>
<script>
import Editor from 'components/editor'
import Header from 'components/header'
import Shell from 'components/shell'
import Hint from 'components/hint'
import Projectview from 'components/projectview'

export default {
  name: 'Home',
  components: {
    editor: Editor,
    heads: Header,
    shell: Shell,
    hint: Hint,
    'project-view': Projectview
  },
  data() {
    return {
      projectViewWidth: '200px',
      commandLineLeft: '250px',
      editorHeight: 'calc(100% - 200px)',
      shellHeight: '190px',
      editorWidth: '100%',
      projectViewIcon: 'ios-copy',
      shellIcon: 'ios-albums',
      fileData: {},
      commandLineWidth: 'calc(100% - 250px)'
    }
  },
  methods: {
    showProjectView: function() {
      if (this.projectViewWidth == '200px') {
        this.projectViewWidth = '0'
        this.commandLineLeft = '50px'
        this.commandLineWidth = 'calc(100% - 50px)'
        this.projectViewIcon = 'ios-copy-outline'
      } else {
        this.projectViewWidth = '200px'
        this.commandLineLeft = '250px'
        this.commandLineWidth = 'calc(100% - 250px)'
        this.projectViewIcon = 'ios-copy'
      }
    },
    showShell: function() {
      if (this.editorHeight == 'calc(100% - 200px)') {
        this.editorHeight = 'calc(100% - 6px)'
        this.shellHeight = '0'
        this.shellIcon = 'ios-albums-outline'
      } else {
        this.editorHeight = 'calc(100% - 200px)'
        this.shellHeight = '190px'
        this.shellIcon = 'ios-albums'
      }
    },
    openFile: function (data) {
      this.fileData = data
    }
  }
}

</script>

<style>
html, body{
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #385c80;
}
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
#content {
    position: relative;
    width: 100%;
    height: calc(100% - 35px);
    background-color: black;
}
#vertialLine {
    position: absolute;
    left: 200px;
    height: 100%;
    width: 2px;
    background-color: white;
    cursor: col-resize;
}
#command_line{
    position: absolute;
    left: 250px;
    height: 100%;
    box-sizing: border-box;
    display: inline-block;
}
#horezonLine {
    height: 2px;
    width: 100%;
    background-color: white;
    cursor: row-resize;
}
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}
</style>
