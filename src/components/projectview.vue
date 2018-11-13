<template>
  <div id="project_view">
    <Tree ref="tree" @openEditor="openEditor"></Tree>
  </div>
</template>

<script>
import Tree from './Tree/tree.vue';
import {mapGetters, mapActions} from 'vuex';
import eventBus from '../util/eventBus.js';

export default {
  data () {
    return {
      ws: null,
      projectId: 0
    };
  },
  computed: {
    ...mapGetters(['projectName', 'tree', 'currentFile'])
  },
  components: {
    Tree
  },
  methods: {
    ...mapActions(['setProjectName', 'setTree']),
    initWebSocket: function () {
      var hostname = window.location.hostname;
      // hostname = 'go-online.heartublade.com';
      this.ws = new WebSocket('ws://' + hostname + '/api/ws/dir');
      let that = this;
      this.ws.onopen = function (evt) {
        console.log('文件树WS已连接');
        // console.log(that.ws);
        that.ws.send(JSON.stringify({
          'jwt': that.$cookie.get('jwt'),
          'project': that.projectName
        }));
      };
      this.ws.onmessage = function (evt) {
        // console.log(evt);
        let data = JSON.parse(evt.data);
        // 若为有效信息
        if (data.ok) {
          // console.log("current tree", that.treeData);
          // console.log('WS update');
          // console.log("changed path", data.path);
          var changedFile;
          if (JSON.stringify(that.tree) !== '{}') {
            changedFile = that.$utilHelper.getNode(that.tree, that.projectName + '/' + data.path).node;
          } else {
            changedFile = null;
          }
          if (data.state === -1) { // 文件夹监听成功
            // 暂时不用处理
          } else if (data.state === 0) { // 文件被创建
            if (!changedFile) {
              // console.log("create local");
              eventBus.$emit('createNodeLocal', data.path, data.type);
            }
          } else if (data.state === 1) { // 文件被删除
            if (changedFile) {
              // console.log("delete local");
              eventBus.$emit('deleteNodeLocal', changedFile);
            }
          } else if (data.state === 2) { // 文件被修改
            // 保存/重命名
            // that.getTree();
          } else if (data.state === 3) { // 文件从此处被移动走
            // that.getTree();
          } else if (data.state === 4) { // 文件被移动到此处
            // that.getTree();
          } else { // 5:未定义行为

          }
        }
      };
      this.ws.onclose = function () {
        console.log('文件树WS已关闭');
        console.log('文件树WS正在重新连接');
        that.initWebSocket();
      };
    },
    getTree: function () {
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log(Response);
        var tree = {
          name: Response.data.name,
          type: Response.data.type,
          root: Response.data.root,
          path: Response.data.name, // 用作唯一ID
          isSelected: false,
          editable: false,
          children: Response.data.children
        };
        if (!tree.children) {
          tree.children = [];
        }
        // 给所有文件填充path（ID）
        this.getChildrenPath(tree.children, tree.path);
        this.$utilHelper.formatChildren(tree);
        this.$utilHelper.treeSort(tree);
        this.setTree({'tree': tree});
      });
    },
    getChildrenPath: function (children, prePath) {
      for (var i = 0, len = children.length; i < len; i++) {
        children[i].path = prePath + '/' + children[i].name;
        var part = children[i].path.split('.');
        var suffix = part[part.length - 1];
        if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg' || suffix === 'bmp' || suffix === 'gif') {
          children[i].isPicture = true;
        } else {
          children[i].isPicture = false;
        }
        if (children[i].children) {
          this.getChildrenPath(children[i].children, children[i].path);
        }
      }
    },
    openEditor: function () {
      this.$emit('openEditor');
    }
  },
  created () {
    this.setProjectName({'projectName': this.$route.params.projectname});
    this.getTree();
    this.initWebSocket();
  },
  beforeDestroy () {
    this.ws.close();
  }
};
</script>

<style>
#project_view {
  width: 100%;
  height: 100%;
  background: #292929;
  box-sizing: border-box;
  overflow-y: hidden;
  overflow-x: hidden;
  display: inline-block;
  font-size: 18px;
}
</style>
