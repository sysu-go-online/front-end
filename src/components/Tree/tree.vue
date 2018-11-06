<template>
  <div id="tree">
    <div id="function_icon" class="hover-pointer">
      <svg class="icon icon-file-add" @click="addFlie"><use xlink:href="#icon-file-add"></use></svg>
      <svg class="icon icon-folder-add" style="margin-left:5px" @click="addFolder"><use xlink:href="#icon-folder-add"></use></svg>
    </div>
    <div id="file_data">
      <tree-menu
        @selectNode="selectNode"
        :nodeData="tree"
        :depth="0"
        :clickable="clickable"
        :menuWidth="menuWidth"
        @changeNode="changeNode"
        @deleteNode="deleteNode"
        @changeClickable="changeClickable"
        @openFile="openFile"
        @contextmenu="Opencontextmenu"
        ref="topTree"
      >
      </tree-menu>
    </div>
    <vue-context ref="menu">
      <ul>
        <li @click="addFlie" v-show="!this.isClickFile">创建文件</li>
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
import eventBus from '../../util/eventBus.js';

export default {
  name: 'directory-tree',
  props: {
    value: {
      default: function () {
        return {};
      }
    }
  },
  data: function () {
    return {
      tree: JSON.parse(JSON.stringify(this.value)),
      selNode: null,
      clickable: true,
      isClickFile: false,
      clickNode: null,
      menuWidth: '100%',
      projectName: 'undefined'
    };
  },
  components: {
    TreeMenu,
    VueContext
  },
  created: function () {
    this.projectName = this.$route.params.projectname;
    eventBus.$on('createNodeLocal', this.createNodeLocal);
  },
  mounted: function () {
    window.addEventListener('scroll', this.updateMenuWidth, true);
    this.$refs.topTree.showChildren = true;
    this.$refs.topTree.arrow_rotate = { transform: `rotate(90deg)` };
  },
  methods: {
    // 选中某个文件、文件夹或取消选中
    selectNode: function (node) {
      if (!this.selNode) {
        // 将当前选中节点的isSelected属性变为true
        this.$utilHelper.getNode(this.tree, node.path).node.isSelected = true;
        this.selNode = node;
        return;
      }
      if (node.path === this.selNode.path) return;
      // 将前一个选中节点的isSelected属性变为false
      this.$utilHelper.getNode(this.tree, this.selNode.path).node.isSelected = false;
      // 将当前选中节点的isSelected属性变为true
      // 临时修复重命名时的BUG
      if(this.$utilHelper.getNode(this.tree, node.path).node) {
        this.$utilHelper.getNode(this.tree, node.path).node.isSelected = true;
      }
      // 记录当前选中节点
      this.selNode = node;
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
    // 打开文件
    openFile: function (node) {
      // 有项目名test/tt.txt
      var filepath = node.path;
      // if(!node.path) {
      //   filepath = this.getFilePath(node, this);
      // }
      // 无项目名tt.txt
      // let newFilepath = filepath.substr(this.projectName.length + 1, filepath.length);
      var file = {
        name: node.name,
        // 待删除
        // id: node.id,
        // 用作唯一ID
        path: filepath,
        isSelected: true,
        isDirty: false
      };
      this.$emit('OpenFile', file);
    },
    // TODO-测试同步
    // 修改节点名称
    changeNode: function (node, name) {
      // var oldfilePath = this.getFilePath(node, this);
      // var relativePath = oldfilePath.substr(this.projectName.length + 1, oldfilePath.length);
      // var newfilePath = relativePath.slice(0, -node.name.length) + name;
      var oldFilePath = node.path;
      var needToSyncCurrent = oldFilePath === this.selNode.path;
      // 选择从服务器拉取的文件时
      // if(oldFilePath === undefined) {
      //   oldFilePath = this.getFilePath(newNode, this, parent)
      // }
      var relativeOldPath = oldFilePath.slice(this.projectName.length + 1);
      var newFilePath = oldFilePath.slice(0, -node.name.length) + name;
      var relativeNewPath = newFilePath.slice(this.projectName.length + 1);
      // console.log(relativeOldPath);
      // console.log(relativeNewPath);
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativeOldPath, {
        'operation': 'rename',
        'content': relativeNewPath
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        this.$utilHelper.getNode(this.tree, node.path).node.name = name;
        this.$utilHelper.getNode(this.tree, node.path).node.path = newFilePath;
        node.name = name;
        node.path = newFilePath;
        this.$utilHelper.childrenSort(this.$utilHelper.getNode(this.tree, newFilePath).parentNode.children);
        this.clickable = !this.clickable;
        // v-model双向绑定，更新父组件数据
        this.$emit('input', this.tree);
        // 获取filepath, 触发父组件数据更新
        // node.path = this.getFilePath(node, this).substr(this.projectName.length + 1, oldfilePath.length);
        this.$utilHelper.getNode(this.tree, newFilePath).node.editable = false;
        if (needToSyncCurrent) {
          this.selNode.name = name;
          this.selNode.path = newFilePath;
        }
        this.$emit('rename', node, oldFilePath);
        this.$emit('rename', node);
        // eventBus.$emit('changeTabName', needToSyncCurrent, node, oldFilePath);
        this.$dialog.alert('重命名成功');
      }).catch(() => {
        console.log('faild');
        this.clickable = !this.clickable;
        this.$utilHelper.getNode(this.tree, node.path).node.editable = false;
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
        // var oldfilePath = this.getFilePath(node, this);
        // var filePath = oldfilePath.substr(this.projectName.length + 1, oldfilePath.length);
        var filePath = node.path;
        var relativePath = filePath.slice(this.projectName.length + 1);
        this.$http.delete('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          var children = this.$utilHelper.getNode(this.tree, filePath).parentNode.children;
          for (var i = 0, len = children.length; i < len; i++) {
            if (children[i].path === filePath) {
              children.splice(i, 1);
              break;
            }
          }
          if (this.selNode && this.selNode.path === filePath) {
            this.selNode = null;
          }
          this.$emit('deleteNode', node);
          // v-model双向绑定，更新父组件数据
          this.tree.switchTo = null;
          this.$emit('input', this.tree);
          this.$dialog.alert('删除成功', {backdropClose: true});
        }).catch(() => {
          // TODO：补充说明原因
          this.$dialog.alert('删除失败', {backdropClose: true});
        });
      });
      // if (this.selNode && this.selNode.id === node.id) {
      //   this.selNode = null;
      // }
      // var oldfilePath = this.getFilePath(node, this);
      // console.log(oldfilePath);
      // var filePath = oldfilePath.substr(this.projectName.length + 1, oldfilePath.length);
      // var children = this.$utilHelper.getNode(this.tree, node.id).parentNode.children;
      // children.forEach((v, i) => {
      //   if (v.id === node.id) {
      //     children.splice(i, 1);
      //   }
      // });
      // 删除节点，触发父节点更新
      // var isSelected = (this.selNode && this.selNode.id === node.id);
      // this.$emit('DelNode', filePath, isSelected);
    },
    // OK-待测试: 修改逻辑，与服务端通信确认后才成功创建
    // 增加文件
    addFlie: function () {
      var parent = null;
      // 未选定任何节点，默认选择根节点
      if (!this.selNode) {
        parent = this.tree;
      } else if (this.selNode.type !== 'dir') {
        parent = this.$utilHelper.getNode(this.tree, this.selNode.path).parentNode;
      } else {
        parent = this.$utilHelper.getNode(this.tree, this.selNode.path).node;
      }
      var children = parent.children;

      let that = this;
      // console.log(children);
      let newNode = {
        name: 'newfile',
        // id: this.$utilHelper.generateUUID(),
        type: 'file',
        isSelected: false,
        children: [],
        editable: false
      };
      let filepath = this.getFilePath(newNode, this, parent);
      // console.log(filepath);
      let relativePath = filepath.substr(this.projectName.length + 1, filepath.length);
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
        // v-model双向绑定，更新父组件数据
        this.$emit('input', this.tree);
      }).catch(() => {
        // TODO：说明具体原因？
        this.$dialog.alert('创建失败');
      });
    },
    // TOFIX: 无法创建两个文件夹（文件名重复）
    // 增加文件夹
    addFolder: function () {
      var parent = null;
      // 未选定任何节点，默认选择根节点
      if (!this.selNode) {
        parent = this.tree;
      } else if (this.selNode.type !== 'dir') {
        parent = this.$utilHelper.getNode(this.tree, this.selNode.path).parentNode;
      } else {
        parent = this.$utilHelper.getNode(this.tree, this.selNode.path).node;
      }
      var children = parent.children;
      if (!children) {
        children = [];
      }
      let that = this;
      let newNode = {
        name: 'newfolder',
        // id: this.$utilHelper.generateUUID(),
        type: 'dir',
        isSelected: false,
        children: [],
        editable: false
      };
      let filepath = this.getFilePath(newNode, this, parent);
      // console.log(filepath);
      let relativePath = filepath.substr(this.projectName.length + 1, filepath.length);
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
        this.$emit('input', this.tree);
      }).catch(() => {
        this.$dialog.alert('创建失败');
        // TODO: 不明操作？
        // this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
        //   headers: {'Authorization': that.$cookie.get('jwt')}
        // }).then(Response => {
        //   var tree = {
        //     name: Response.data.name,
        //     id: Response.data.id,
        //     type: Response.data.type,
        //     root: Response.data.root,
        //     isSelected: false,
        //     editable: false,
        //     children: Response.data.children
        //   };
        //   this.$utilHelper.formatChildren(tree);
        //   this.$utilHelper.treeSort(tree);
        //   this.tree = tree;
        // });
      });
    },
    // 获取完整文件路径
    getFilePath: function (node, that, parentNode = that.$utilHelper.getNode(that.tree, node.path).parentNode) {
      var filePath = node.name;
      while (parentNode != null) {
        node = parentNode;
        filePath = parentNode.name + '/' + filePath;
        parentNode = that.$utilHelper.getNode(that.tree, node.path).parentNode;
      }
      return filePath;
    },
    updateMenuWidth: function (el) {
      this.menuWidth = document.getElementById('file_data').scrollWidth + 'px';
    },
    deleteNodeFunc: function () {
      this.deleteNode(this.clickNode);
    },
    createNodeLocal: function (relativePath) {
      var completePath = this.projectName + '/' + relativePath;
      var part = completePath.split('/');
      var fileName = part.pop();
      var parentPath = part.join('/');
      var children = this.$utilHelper.getNode(this.tree, parentPath).node.children;
      let newNode = {
        name: fileName,
        path: completePath,
        type: 'file',
        isSelected: false,
        children: [],
        editable: false
      };
      children.push(newNode);
    }
  },
  watch: {
    value: {
      handler: function (val, oldVal) {
        // 深度复制
        this.tree = JSON.parse(JSON.stringify(val));
        if (this.tree.switchTo) {
          // console.log("top");
          this.selectNode(this.tree.switchTo);
        }
      },
      deep: true
    }
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
