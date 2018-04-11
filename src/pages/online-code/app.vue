<template>
  <div id="home">
    <heads></heads>
    <div id="content">
      <project-view></project-view>
      <editor></editor>
      <div id="command_line">
        <hint></hint>
        <shell></shell>
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
  }
}
</script>

<style>
html, body, #app{
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
}
#command_line{
    position: absolute;
    left: 65%;
    height: 100%;
    width: 35%;
    box-sizing: border-box;
    display: inline-block;
}
</style>
