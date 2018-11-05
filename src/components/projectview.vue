<template>
  <div id="project_view">
    <Tree ref="tree" v-model="treeData" @OpenFile="OpenFile" @SaveEdit="SaveEdit" @deleteNode="deleteNode" @rename="renameNode"></Tree>
  </div>
</template>

<script>
import Tree from './Tree/tree.vue';
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
    this.getTree(this);
    this.initWebSocket();
  },
  methods: {
    initWebSocket: function () {
      this.ws = new WebSocket('ws://' + window.location.hostname + '/api/ws/dir');
      this.ws.onopen = function (evt) {
        this.ws.send(JSON.stringify({
          'jwt': this.$cookie.get('jwt'),
          'project': this.projectName
        }));
      };
      this.ws.onmessage = function (evt) {
        // console.log(evt);
        let data = JSON.parse(evt.data);
        // 若为有效信息
        if (data.ok) {
          // TO-IMPROVE: 直接拉整颗树，暴力更新
          this.getTree(this);
          // let path = data.path;
          // if (data.type === -1) { // 文件被创建成功

          // } else if (data.type === 0) { // 文件被创建

          // } else if (data.type === 1) { // 文件被删除

          // } else if (data.type === 2) { // 文件被修改

          // } else if (data.type === 3) { // 文件从此处被移动走

          // } else if (data.type === 4) { // 文件被移动到此处

          // } else { // 5:未定义行为

          // }
        }
      };
    },
    getTree (that) {
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
        headers: {'Authorization': that.$cookie.get('jwt')}
      }).then(Response => {
        console.log(Response);
        var tree = {
          name: Response.data.name,
          type: Response.data.type,
          root: Response.data.root,
          // name: this.projectName,
          // type: 'dir',
          // root: true,
          isSelected: false,
          editable: false,
          // 同步标签栏切换文件
          switchTo: null,
          children: Response.data.children
        };
        if(!tree.children) {
          tree.children = [];
        }
        tree.children.forEach(child => {
          child.id = this.$utilHelper.generateUUID();
        });
        this.$utilHelper.formatChildren(tree);
        this.$utilHelper.treeSort(tree);
        this.treeData = tree;
      });
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
    renameNode: function (node) {
      // this.currentFiledata = node;
      this.$emit('renameFile', node);
    },
    OpenFile: function (file) {
      this.currentFiledata = file;
      this.currentFiledata['projectid'] = this.projectId;
      this.$emit('openfile', this.currentFiledata, this.projectName);
    }
  },
  watch: {
    value: {
      handler: function (val, oldval) {
        if (JSON.stringify(val) !== '{}') {
          if (val.id !== this.currentFiledata.id) {
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
