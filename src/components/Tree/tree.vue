<template>
  <div id="tree">
    <div id="function_icon">
      <svg class="icon icon-file-add" @click="addFlie"><use xlink:href="#icon-file-add"></use></svg>
      <svg class="icon icon-folder-add" style="margin-left:5px" @click="addFolder"><use xlink:href="#icon-folder-add"></use></svg>
    </div>
    <div id="file_data" @contextmenu.prevent="$refs.menu.open">
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
      >
      </tree-menu>
    </div>
    <vue-context ref="menu">
      <ul>
        <li @click="addFlie">创建文件</li>
        <li @click="addFolder">创建文件夹</li>
        <li @click="deleteNodeFunc">删除</li>
      </ul>
    </vue-context>
  </div>
</template>

<script>
import TreeMenu from './treeMenu.vue';
import { VueContext } from 'vue-context';
export default {
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
      menuWidth: '100%',
      projectName: 'undefined'
    };
  },
  name: 'App',
  components: {
    TreeMenu,
    VueContext
  },
  created: function () {
    this.projectName = this.$route.params.projectname;
  },
  mounted: function () {
    window.addEventListener('scroll', this.updateMenuWidth, true);
  },
  methods: {
    // 选中某个文件、文件夹或取消选中
    selectNode: function (node) {
      if (!this.selNode) {
        // 将当前选中节点的isSelected属性变为true
        this.$utilHelper.getNode(this.tree, node.id).node.isSelected = true;
        this.selNode = node;
        return;
      }
      // 将前一个选中节点的isSelected属性变为false
      this.$utilHelper.getNode(this.tree, this.selNode.id).node.isSelected = false;
      // 将当前选中节点的isSelected属性变为true
      this.$utilHelper.getNode(this.tree, node.id).node.isSelected = true;
      // 记录当前选中节点
      this.selNode = node;
    },
    // 修改节点的可点击性
    changeClickable: function () {
      this.clickable = !this.clickable;
    },
    // 打开文件
    openFile: function (node) {
      let filepath = this.getFilePath(node, this);
      let newFilepath = filepath.substr(this.projectName.length + 1, filepath.length);
      var file = {
        name: node.name,
        filepath: newFilepath,
        nodeData: node
      };
      this.$emit('OpenFile', file);
    },
    // 修改节点名称
    changeNode: function (node, name) {
      var oldfilePath = this.getFilePath(node, this);
      var filePath = oldfilePath.substr(this.projectName.length + 1, oldfilePath.length);
      var newfilePath = filePath.slice(0, -node.name.length) + name;
      console.log(newfilePath);
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + filePath, {
        'operation': 'rename',
        'content': newfilePath
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        this.$utilHelper.getNode(this.tree, node.id).node.name = name;
        this.$utilHelper.childrenSort(this.$utilHelper.getNode(this.tree, node.id).parentNode.children);
        this.clickable = !this.clickable;
        // v-model双向绑定，更新父组件数据
        this.$emit('input', this.tree);
        // 获取filepath, 触发父组件数据更新
        node.name = name;

        // var isSelected = this.selNode && this.selNode.id === node.id;
        // var isDir = node.type === 'dir';
        // this.$emit('SaveEdit', name, filePath, isSelected, isDir)
        this.$dialog.alert('重命名成功');
      });
    },
    // 删除节点
    deleteNode: function (node) {
      if (this.selNode && this.selNode.id === node.id) {
        this.selNode = null;
      }
      var oldfilePath = this.getFilePath(node, this);
      var filePath = oldfilePath.substr(this.projectName.length + 1, oldfilePath.length);
      var children = this.$utilHelper.getNode(this.tree, node.id).parentNode.children;
      children.forEach((v, i) => {
        if (v.id === node.id) {
          children.splice(i, 1);
        }
      });
      // v-model双向绑定，更新父组件数据
      this.$emit('input', this.tree);
      // 删除节点，触发父节点更新
      var isSelected = (this.selNode && this.selNode.id === node.id);
      this.$emit('DelNode', filePath, isSelected);
    },
    // 增加文件
    addFlie: function () {
      if (!this.selNode || this.selNode.type !== 'dir') {
        return;
      }
      let that = this;
      if (undefined === this.$utilHelper.getNode(this.tree, this.selNode.id).node.children) {
        this.$utilHelper.getNode(this.tree, this.selNode.id).node.children = [];
      }
      var children = this.$utilHelper.getNode(this.tree, this.selNode.id).node.children;
      let newNode = {
        name: 'newfile',
        id: this.$utilHelper.generateUUID(),
        type: 'file',
        isSelected: false,
        children: []
      };
      children.push(newNode);
      this.$utilHelper.childrenSort(children);
      // v-model双向绑定，更新父组件数据
      // this.$emit('input', this.tree)
      let filepath = this.getFilePath(newNode, this);
      let newFilepath = filepath.substr(this.projectName.length + 1, filepath.length);
      this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + newFilepath, {
        'dir': false
      }, {
        headers: {
          'Authorization': that.$cookie.get('jwt'),
          'Content-Type': 'application/json'
        }
      });
    },
    // 增加文件夹
    addFolder: function () {
      if (!this.selNode || this.selNode.type !== 'dir') {
        return;
      }
      let that = this;
      if (undefined === this.$utilHelper.getNode(this.tree, this.selNode.id).node.children) {
        this.$utilHelper.getNode(this.tree, this.selNode.id).node.children = [];
      }
      var children = this.$utilHelper.getNode(this.tree, this.selNode.id).node.children;

      let newNode = {
        name: 'newfolder',
        id: this.$utilHelper.generateUUID(),
        type: 'dir',
        isSelected: false,
        children: []
      };
      children.push(newNode);
      this.$utilHelper.childrenSort(children);
      // v-model双向绑定，更新父组件数据
      let filepath = this.getFilePath(newNode, this);
      let newFilepath = filepath.substr(this.projectName.length + 1, filepath.length);
      this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + newFilepath, {
        'dir': true
      }, {
        headers: {
          'Authorization': that.$cookie.get('jwt'),
          'Content-Type': 'application/json'
        }
      });
      // this.$emit('input', this.tree)
    },
    // 获取文件路径
    getFilePath: function (node, that) {
      var parentNode = that.$utilHelper.getNode(that.tree, node.id).parentNode;
      var filePath = node.name;
      while (parentNode != null) {
        node = parentNode;
        filePath = parentNode.name + '/' + filePath;
        parentNode = that.$utilHelper.getNode(that.tree, node.id).parentNode;
      }
      return filePath;
    },
    updateMenuWidth: function (el) {
      this.menuWidth = document.getElementById('file_data').scrollWidth + 'px';
    },
    deleteNodeFunc: function () {
      this.deleteNode(this.selNode);
    }
  },
  watch: {
    value: {
      handler: function (val, oldval) {
        console.log(val);
        // 深度复制
        this.tree = JSON.parse(JSON.stringify(val));
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
