<template>
  <div id="home">
    <heads></heads>
    <div id="content">
      <project-view v-bind:style="{width: projectViewWidth}"></project-view>
      <div id="vertialLine" v-on:dblclick="showProjectView" v-bind:style="{left: vertialLineLeft}"></div>
      <div id="command_line" v-bind:style="{width: commandLineWidth, left: commandLineLeft}">
        <editor v-bind:style="{height: editorHeight}"></editor>
        <div id="horezonLine" v-on:dblclick="showShell"></div>
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
      commandLineWidth: 'calc(100% - 202px)',
      commandLineLeft: '202px',
      vertialLineLeft: '200px',
      editorHeight: 'calc(100% - 200px)',
      shellHeight: '190px',
    }
  },
  methods: {
    showProjectView: function() {
      if (this.projectViewWidth == '200px') {
        this.projectViewWidth = '0'
        this.commandLineWidth = 'calc(100% - 2px)'
        this.commandLineLeft = '2px'
        this.vertialLineLeft = '0'
      } else {
        this.projectViewWidth = '200px'
        this.commandLineWidth = 'calc(100% - 202px)'
        this.commandLineLeft = '202px'
        this.vertialLineLeft = '200px'
      }
    },
    showShell: function() {
      if (this.editorHeight == 'calc(100% - 200px)') {
        this.editorHeight = 'calc(100% - 8px)'
        this.shellHeight = '0'
      } else {
        this.editorHeight = 'calc(100% - 200px)'
        this.shellHeight = '190'
      }
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
    left: 202px;
    height: 100%;
    width: calc(100% - 202px);
    box-sizing: border-box;
    display: inline-block;
}
#horezonLine {
    height: 2px;
    width: 100%;
    background-color: white;
    cursor: row-resize;
}
</style>
