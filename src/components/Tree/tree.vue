<template>
  <div id="tree">
    <div id="function_icon" class="hover-pointer">
      <svg class="icon icon-file-add" @click="addFile"><use xlink:href="#icon-file-add"></use></svg>
      <svg class="icon icon-folder-add" style="margin-left:5px" @click="addFolder"><use xlink:href="#icon-folder-add"></use></svg>
    </div>
    <div id="file_data">
      <tree-menu
        @selectNode="selectNode"
        :nodeData="localTree"
        :depth="0"
        :clickable="clickable"
        :menuWidth="menuWidth"
        @changeNode="changeNode"
        @deleteNode="deleteNode"
        @changeClickable="changeClickable"
        @contextmenu="Opencontextmenu"
        ref="topTree"
      >
      </tree-menu>
    </div>
    <vue-context ref="menu">
      <ul>
        <li @click="addFile" v-show="!this.isClickFile">创建文件</li>
        <li @click="addFolder" v-show="!this.isClickFile">创建文件夹</li>
        <li @click="changeEditable">重命名</li>
        <li @click="deleteNodeFunc">删除</li>
      </ul>
    </vue-context>
  </div>
</template>

<script>
import TreeMenu from './treeMenu.vue';
import { VueContext } from 'vue-context';
import {mapGetters, mapActions} from 'vuex';
import eventBus from '../../util/eventBus.js';

export default {
  name: 'directory-tree',
  data: function () {
    return {
      localTree: {},
      localOpenFiles: {},
      localOpenFileOrder: [],
      clickable: true,
      isClickFile: false,
      clickNode: null,
      fileNum: 0,
      folderNum: 0,
      menuWidth: '100%'
    };
  },
  computed: {
    ...mapGetters(['projectName', 'tree', 'currentFile', 'openFiles', 'openFileOrder'])
  },
  components: {
    TreeMenu,
    VueContext
  },
  methods: {
    ...mapActions(['setProjectName', 'setTree', 'setCurrentFile', 'setOpenFiles', 'setOpenFileOrder']),
    // 选中某个文件、文件夹或取消选中
    selectNode: function (node) {
      // 切换为空节点时
      if (!node) {
        // console.log(this.currentFile.path);
        if (this.$utilHelper.getNode(this.localTree, this.currentFile.path).node) {
          this.$utilHelper.getNode(this.localTree, this.currentFile.path).node.isSelected = false;
        }
        this.setCurrentFile({'currentFile': null});
        this.setOpenFiles({'openFiles': this.localOpenFiles});
        this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
        this.setTree({'tree': this.localTree});
        return;
      }
      node.isSelected = true;
      // 若当前无已打开的文件
      if (node.isPicture) {
        eventBus.$emit('showPicture', true);
      } else {
        eventBus.$emit('showPicture', false);
      }
      if (!this.currentFile) {
        // 将当前选中节点的isSelected属性变为true
        var file = this.$utilHelper.getNode(this.localTree, node.path).node;
        file.isSelected = true;
        // this.$utilHelper.getNode(this.localTree, node.path).node.isSelected = true;
        this.localOpenFiles[file.path] = file;
        this.$emit('openEditor');
      } else if (node.path === this.currentFile.path) {
        return;
      } else {
        // 若已打开文件，则调整打开顺序
        if (this.localOpenFiles[node.path]) {
          this.localOpenFileOrder.splice(this.localOpenFileOrder.indexOf(node.path), 1);
        }
        // console.log(this.localTree);
        // 更新数据
        var lastNode = this.$utilHelper.getNode(this.localTree, this.currentFile.path).node;
        var currentNode = this.$utilHelper.getNode(this.localTree, node.path).node;
        // TOFIX-从目录删除文件时，this.localTree不同步
        if (lastNode) {
          lastNode.isSelected = false;
          this.localOpenFiles[lastNode.path] = lastNode;
        }
        if (currentNode) {
          currentNode.isSelected = true;
          this.localOpenFiles[currentNode.path] = currentNode;
        }
      }
      // 记录当前选中节点
      this.setOpenFiles({'openFiles': this.localOpenFiles});
      // 更新打开文件的顺序，用于回溯
      this.localOpenFileOrder.push(node.path);
      this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
      this.setCurrentFile({'currentFile': node});
      this.setTree({'tree': this.localTree});
    },
    // 修改节点的可点击性
    changeClickable: function () {
      this.clickable = !this.clickable;
    },
    changeEditable: function () {
      this.clickable = !this.clickable;
      this.$utilHelper.getNode(this.tree, this.clickNode.path).node.editable = true;
    },
    Opencontextmenu: function (evt, node) {
      if (node.type === 'file') {
        this.isClickFile = true;
      } else {
        this.isClickFile = false;
      }
      this.clickNode = node;
      this.$refs.menu.open(evt);
    },
    // TOFIX-重命名文件夹时，修改子文件路径
    // 修改节点名称
    changeNode: function (node, name) {
      // console.log('changeing "' + node.name + '" name');
      // console.log(this.localTree);
      var oldFilePath = node.path;
      var relativeOldPath = oldFilePath.slice(this.projectName.length + 1);
      var newFilePath = oldFilePath.slice(0, -node.name.length) + name;
      var relativeNewPath = newFilePath.slice(this.projectName.length + 1);
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativeOldPath, {
        'operation': 'rename',
        'content': relativeNewPath
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log(this.localTree);
        var file = this.$utilHelper.getNode(this.localTree, oldFilePath).node;
        file.name = name;
        file.path = newFilePath;
        // console.log(this.$utilHelper.getNode(this.localTree, newFilePath).node);
        this.$utilHelper.childrenSort(this.$utilHelper.getNode(this.localTree, newFilePath).parentNode.children);
        this.clickable = !this.clickable;
        file.editable = false;
        // 同步store数据
        if (this.localOpenFileOrder.indexOf(oldFilePath) !== -1) {
          console.log('is open file');
          delete this.localOpenFiles[oldFilePath];
          this.localOpenFiles[newFilePath] = JSON.parse(JSON.stringify(file));
          this.localOpenFileOrder[this.localOpenFileOrder.indexOf(oldFilePath)] = newFilePath;
          eventBus.$emit('renameTab', file, oldFilePath);
          if (oldFilePath === this.currentFile.path) {
            this.setCurrentFile({'currentFile': JSON.parse(JSON.stringify(file))});
          }
          this.setOpenFiles({'openFiles': this.localOpenFiles});
          this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
        }
        this.setTree({'tree': this.localTree});
        this.$dialog.alert('重命名成功');
      }).catch(() => {
        this.clickable = !this.clickable;
        this.$utilHelper.getNode(this.localTree, node.path).node.editable = false;
        this.$dialog.alert('重命名失败');
      });
    },
    // TOFIX-删除一整个文件夹时，同步编辑器
    // 删除节点
    deleteNode: function (node) {
      this.$dialog.confirm('是否确实要删除' + node.name + '?', {
        okText: '是',
        cancelText: '否'
      }).then(() => {
        var filePath = node.path;
        var relativePath = filePath.slice(this.projectName.length + 1);
        this.$http.delete('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          var children = this.$utilHelper.getNode(this.localTree, filePath).parentNode.children;
          for (var i = 0, len = children.length; i < len; i++) {
            if (children[i].path === filePath) {
              // 如果是文件夹，则递归删除里面的子文件
              // var subLen = children[i].children.length;
              // if (subLen) {
              //   for (var j = 0; j < subLen; j++) {
              //     this.deleteNode(children[i].children[j]);
              //   }
              // }
              children.splice(i, 1);
              break;
            }
          }
          if (this.localOpenFileOrder.indexOf(filePath) !== -1) {
            delete this.localOpenFiles[filePath];
            this.localOpenFileOrder.splice(this.localOpenFileOrder.indexOf(filePath), 1);
            eventBus.$emit('closeTab', filePath);
            if (filePath === this.currentFile.path) {
              var openNum = this.localOpenFileOrder.length;
              if (openNum) {
                console.log(this.localTree);
                this.selectNode(this.localOpenFiles[this.localOpenFileOrder[openNum - 1]]);
              } else {
                this.selectNode(null);
              }
              this.$dialog.alert('删除成功', {backdropClose: true});
              return;
            }
            this.setOpenFiles({'openFiles': this.localOpenFiles});
            this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
          }
          this.setTree({'tree': this.localTree});
          this.$dialog.alert('删除成功', {backdropClose: true});
        }).catch(() => {
          // TODO：补充说明原因
          this.$dialog.alert('删除失败', {backdropClose: true});
        });
      });
    },
    // 增加文件
    addFile: function () {
      console.log('call');
      var parent = null;
      // 未选定任何节点，默认选择根节点
      if (!this.currentFile) {
        parent = this.localTree;
      } else if (this.currentFile.type !== 'dir') {
        parent = this.$utilHelper.getNode(this.localTree, this.currentFile.path).parentNode;
      } else {
        parent = this.$utilHelper.getNode(this.localTree, this.currentFile.path).node;
      }
      var children = parent.children;

      let that = this;
      // console.log(children);
      let newNode = {
        name: 'newfile_' + this.fileNum++,
        // id: this.$utilHelper.generateUUID(),
        type: 'file',
        isSelected: false,
        children: [],
        editable: false
      };
      let filepath = this.getFilePath(newNode, this, parent);
      // console.log(filepath);
      let relativePath = filepath.slice(this.projectName.length + 1);
      // console.log(newFilepath);
      this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        'dir': false
      }, {
        headers: {
          'Authorization': that.$cookie.get('jwt'),
          'Content-Type': 'application/json'
        }
      }).then(Response => {
        // TO-FIX两种情况，重名/不重名
        // console.log(Response);
        newNode.path = filepath;
        children.push(newNode);
        this.$utilHelper.childrenSort(children);
        this.setTree({'tree': this.localTree});
      }).catch(() => {
        // TODO：说明具体原因？
        this.$dialog.alert('创建失败');
      });
    },
    // 增加文件夹
    addFolder: function () {
      var parent = null;
      // 未选定任何节点，默认选择根节点
      if (!this.currentFile) {
        parent = this.localTree;
      } else if (this.currentFile.type !== 'dir') {
        parent = this.$utilHelper.getNode(this.localTree, this.currentFile.path).parentNode;
      } else {
        parent = this.$utilHelper.getNode(this.localTree, this.currentFile.path).node;
      }
      var children = parent.children;
      // if (!children) {
      //   children = [];
      // }
      let that = this;
      let newNode = {
        name: 'newfolder_' + this.folderNum++,
        // id: this.$utilHelper.generateUUID(),
        type: 'dir',
        isSelected: false,
        children: [],
        editable: false
      };
      let filepath = this.getFilePath(newNode, this, parent);
      // console.log(filepath);
      let relativePath = filepath.slice(this.projectName.length + 1);
      // console.log(newFilepath);
      this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        'dir': true
      }, {
        headers: {
          'Authorization': that.$cookie.get('jwt'),
          'Content-Type': 'application/json'
        }
      }).then(Response => {
        newNode.path = filepath;
        children.push(newNode);
        this.$utilHelper.childrenSort(children);
        // v-model双向绑定，更新父组件数据
        // this.$emit('input', this.tree);
        this.setTree({'tree': this.localTree});
      }).catch(() => {
        this.$dialog.alert('创建失败');
      });
    },
    // 获取完整文件路径
    getFilePath: function (node, that, parentNode = that.$utilHelper.getNode(that.localTree, node.path).parentNode) {
      var filePath = node.name;
      while (parentNode != null) {
        node = parentNode;
        filePath = parentNode.name + '/' + filePath;
        parentNode = that.$utilHelper.getNode(that.localTree, node.path).parentNode;
      }
      return filePath;
    },
    updateMenuWidth: function (el) {
      this.menuWidth = document.getElementById('file_data').scrollWidth + 'px';
    },
    deleteNodeFunc: function () {
      this.deleteNode(this.clickNode);
    },
    createNodeLocal: function (relativePath, filetype) {
      // console.log("enter create");
      var completePath = this.projectName + '/' + relativePath;
      var part = completePath.split('/');
      var fileName = part.pop();
      var suffix = fileName.split('.').pop();
      var isPicture = false;
      if (filetype === 'file') {
        if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg' || suffix === 'bmp' || suffix === 'gif') {
          isPicture = true;
        }
      }
      var parentPath = part.join('/');
      var children = this.$utilHelper.getNode(this.localTree, parentPath).node.children;
      let newNode = {
        name: fileName,
        path: completePath,
        type: filetype,
        isSelected: false,
        isPicture: isPicture,
        children: [],
        editable: false
      };
      children.push(newNode);
      this.$utilHelper.childrenSort(children);
      // this.$emit('input', this.tree);
      this.setTree({'tree': this.localTree});
    },
    deleteNodeLocal: function (node) {
      var children = this.$utilHelper.getNode(this.localTree, node.path).parentNode.children;
      for (var i = 0, len = children.length; i < len; i++) {
        if (children[i].path === node.path) {
          children.splice(i, 1);
          break;
        }
      }
      // console.log("after tree", this.tree);
      if (this.localOpenFileOrder.indexOf(node.path) !== -1) {
        delete this.localOpenFiles[node.path];
        this.localOpenFileOrder.splice(this.localOpenFileOrder.indexOf(node.path), 1);
        eventBus.$emit('closeTab', node.path);
        if (node.path === this.currentFile.path) {
          var openNum = this.localOpenFileOrder.length;
          if (openNum) {
            this.selectNode(this.localOpenFiles[this.localOpenFileOrder[openNum - 1]]);
          } else {
            this.selectNode(null);
          }
          return;
        }
        this.setOpenFiles({'openFiles': this.localOpenFiles});
        this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
      }
      this.setTree({'tree': this.localTree});
    }
  },
  watch: {
    tree: {
      handler: function (newTree, oldTree) {
        // 深度复制
        this.localTree = JSON.parse(JSON.stringify(newTree));
      },
      deep: true
    },
    openFiles: {
      handler: function (newFiles, oldFiles) {
        // 深度复制
        this.localOpenFiles = JSON.parse(JSON.stringify(newFiles));
      },
      deep: true
    },
    openFileOrder: {
      handler: function (newOrder, oldOrder) {
        // 深度复制
        this.localOpenFileOrder = newOrder.concat();
      },
      deep: true
    }
  },
  created: function () {
    // this.projectName = this.$route.params.projectname;
    eventBus.$on('callSelNodeFromEditor', this.selectNode);
    eventBus.$on('createNodeLocal', this.createNodeLocal);
    eventBus.$on('deleteNodeLocal', this.deleteNodeLocal);
    eventBus.$on('callNewFileFromMenu', this.addFile);
    eventBus.$on('callNewFolderFromMenu', this.addFolder);
  },
  mounted: function () {
    window.addEventListener('scroll', this.updateMenuWidth, true);
    this.$refs.topTree.showChildren = true;
    this.$refs.topTree.arrow_rotate = { transform: `rotate(90deg)` };
  },
  beforeDestroy () {
    this.setProjectName({'projectName': ''});
    this.setOpenFiles({'openFiles': {}});
    this.setOpenFileOrder({'openFileOrder': []});
    this.setCurrentFile({'currentFile': null});
    this.setTree({'tree': {}});
  }
};
</script>

<style>
.icon-file-add, .icon-folder-add {
  width: 20px !important;
  height: 20px !important;
}
#tree {
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
  color:#009A61;
}
#function_icon {
  position: relative;
  margin-top: 10px;
  height: 30px;
  width: 60px;
  float: right;
}
#file_data {
  height: calc(100% - 40px);
  width: 100%;
  overflow: auto;
}

.right-menu {
  position: fixed;
  background: #101010;
  /*border: solid 1px rgba(0, 0, 0, .2);
  border-radius: 3px;*/
  z-index: 999;
  display: none;
}
.right-menu a {
  width: 100px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  display: block;
  color: #ffffff;
  text-decoration: none;
}
.right-menu a:hover {
  background: #ffffff;
  color: #101010;
}
</style>
