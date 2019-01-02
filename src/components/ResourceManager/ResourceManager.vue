<template>
  <layout id="resourceManager">
    <i-header id='shortcutBarContainer'>
      <shortcut-bar></shortcut-bar>
    </i-header>
    <i-content id='directoryTreeContainer'>
      <directory-tree></directory-tree>
    </i-content>
  </layout>
</template>

<script>
import DirectoryTree from './DirectoryTree.vue';
import ShortcutBar from './ShortcutBar.vue';
// import eventBus from '../../util/eventBus.js';

export default {
  name: 'ResourceManager',
  data () {
    return {};
  },
  components: {
    'directory-tree': DirectoryTree,
    'shortcut-bar': ShortcutBar
  },
  methods: {
  }
};
</script>

<style>
#resourceManager {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
#shortcutBarContainer {
  height: 35px;
  width: 100%;
  padding: 0px;
  background-color: #282C34;
  font-size: 16px;
  font-weight: bold;
}
#directoryTreeContainer {
  position: relative;
  width: 100%;
  background-color: #21252B;
}
</style>
