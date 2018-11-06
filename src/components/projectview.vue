<template>
  <div id="project_view">
    <Tree ref="tree" v-model="treeData" @OpenFile="OpenFile" @SaveEdit="SaveEdit" @deleteNode="deleteNode" @rename="renameNode"></Tree>
  </div>
</template>

<script>
import Tree from './Tree/tree.vue';
import eventBus from '../util/eventBus.js';

export default {
  data () {
    return {
      // 未和tree同步
      ws: null,
      treeData: {},
      projectId: 0,
      currentFiledata: {},
      projectName: 'undefined'
    };
  },
  props: {
    // 接收上层v-model
    value: {
      default: function () {
        return {};
      }
    }
  },
  components: {
    Tree
  },
  created: function () {
    this.projectName = this.$route.params.projectname;
    this.getTree();
    this.initWebSocket();
    // eventBus.$on('changeTabName', this.checkToRenameCurrent);
  },
  methods: {
    initWebSocket: function () {
      this.ws = new WebSocket('ws://' + window.location.hostname + '/api/ws/dir');
      let that = this;
      // this.ws = new WebSocket('ws://' + 'go-online.heartublade.com' + '/api/ws/dir');
      this.ws.onopen = function (evt) {
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
        if (data.ok && JSON.stringify(that.treeData) !== '{}') {
          // console.log("current tree", that.treeData);
          // console.log('WS update');
          // console.log("changed path", data.path);
          var changedFile = that.$utilHelper.getNode(that.treeData, that.projectName + '/' + data.path).node;
          // console.log("found at local", changedFile);
          // TO-IMPROVE: 直接拉整颗树，暴力更新
          // that.getTree();
          // let path = data.path;
          // console.log('status', data.type);
          if (data.type === -1) { // 文件夹监听成功
      
          } else if (data.type === 0) { // 文件被创建
            if (!changedFile) {
              // that.getTree();
              // 需要文件类型-dir/file,默认file
              // console.log("create local");
              eventBus.$emit('createNodeLocal', data.path);
            }
          } else if (data.type === 1) { // 文件被删除
            if (changedFile) {
              // console.log("delete local");
              eventBus.$emit('deleteNodeLocal', changedFile);
            }
          } else if (data.type === 2) { // 文件被修改
            // 保存/重命名
            // that.getTree();
          } else if (data.type === 3) { // 文件从此处被移动走
            // that.getTree();
          } else if (data.type === 4) { // 文件被移动到此处
            // that.getTree();
          } else { // 5:未定义行为

          }
        }
      };
    },
    getTree () {
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log(Response);
        var tree = {
          name: Response.data.name,
          type: Response.data.type,
          root: Response.data.root,
          path: Response.data.name, // 用作唯一ID
          // name: this.projectName,
          // type: 'dir',
          // root: true,
          isSelected: false,
          editable: false,
          // 同步标签栏切换文件
          switchTo: null,
          children: Response.data.children
        };
        if (!tree.children) {
          tree.children = [];
        }
        // 给所有文件填充path（ID）
        this.getChildrenPath(tree.children, tree.path);
        // tree.children.forEach(child => {

        //   // child.id = this.$utilHelper.generateUUID();
        // });
        this.$utilHelper.formatChildren(tree);
        this.$utilHelper.treeSort(tree);
        this.treeData = tree;
      });
    },
    getChildrenPath: function (children, prePath) {
      for (var i = 0, len = children.length; i < len; i++) {
        children[i].path = prePath + '/' + children[i].name;
        if (children[i].children) {
          this.getChildrenPath(children[i].children, children[i].path);
        }
      }
    },
    SaveEdit: function (fileName, filePath, isSelectedNode, isDir) {
      var that = this;
      this.$http
        .put('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files' + filePath, {
          dir: isDir
        })
        .then(Response => {
          console.log(Response.status);
          if (isSelectedNode) {
            that.currentFiledata.name = fileName;
            that.currentFiledata.path = filePath;
            that.$emit('openfile', that.currentFiledata);
          }
        });
    },
    deleteNode: function (node) {
      this.$emit('deleteFile', node);
    },
    renameNode: function (node, oldFilePath) {
      this.$emit('renameFile', node, oldFilePath);
    },
    // TODO:改逻辑
    // DelNode: function (filePath, isSelectedNode) {
    //   let that = this;
    //   this.$http
    //     .delete('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + filePath, {
    //       headers: {'Authorization': that.$cookie.get('jwt')}
    //     }).then(Response => {
    //       that.$dialog.alert('删除成功');
    //     });
    //   if (isSelectedNode) {
    //     this.currentFiledata.name = '';
    //     this.currentFiledata.path = '';
    //     this.$emit('openfile', this.currentFiledata);
    //   }
    // },
    OpenFile: function (file) {
      this.currentFiledata = file;
      this.currentFiledata['projectid'] = this.projectId;
      this.$emit('openfile', this.currentFiledata, this.projectName);
    }
    // checkToRenameCurrent: function (need, data) {
    //   if (need) {
    //     this.currentFileData = data;
    //   }
    // }
  },
  watch: {
    value: {
      handler: function (val, oldval) {
        if (JSON.stringify(val) !== '{}') {
          if (val.path !== this.currentFiledata.path) {
            // console.log("switchFromTop");
            this.currentFiledata = val;
            // TOFIX
            this.treeData.switchTo = val;
          }
        }
      },
      deep: true
    }
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
