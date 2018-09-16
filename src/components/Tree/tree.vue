<template>
  <div id="tree">
    <div id="function_icon">
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
      >
      </tree-menu>
    </div>
  </div>
</template>

<script>
import TreeMenu from './treeMenu.vue'
export default {
  props: {
    value: {
      default: function () {
        return {}
      }
    }
  },
  data: function () {
    return {
      tree: JSON.parse(JSON.stringify(this.value)),
      selNode: null,
      clickable: true,
      menuWidth: '100%'
    }
  },
  name: 'App',
  components: {
    TreeMenu
  },
  mounted: function () {
    window.addEventListener('scroll', this.updateMenuWidth, true)
  },
  methods: {
    // 选中某个文件、文件夹或取消选中
    selectNode: function (node) {
      if (!this.selNode) {
        // 将当前选中节点的isSelected属性变为true
        this.$utilHelper.getNode(this.tree, node.id).node.isSelected = true
        this.selNode = node
        return
      }
      // 将前一个选中节点的isSelected属性变为false
      this.$utilHelper.getNode(this.tree, this.selNode.id).node.isSelected = false
      // 将当前选中节点的isSelected属性变为true
      this.$utilHelper.getNode(this.tree, node.id).node.isSelected = true
      // 记录当前选中节点
      this.selNode = node
    },
    // 修改节点的可点击性
    changeClickable: function () {
      this.clickable = !this.clickable
    },
    // 打开文件
    openFile: function (node) {
      var file = {
        name: node.name,
        filepath: this.getFilePath(node, this),
        nodeData: node
      }
      this.$emit('OpenFile', file)
    },
    // 修改节点名称
    changeNode: function (node, name) {
      this.$utilHelper.getNode(this.tree, node.id).node.name = name
      this.$utilHelper.childrenSort(this.$utilHelper.getNode(this.tree, node.id).parentNode.children)
      this.clickable = !this.clickable
      // v-model双向绑定，更新父组件数据
      this.$emit('input', this.tree)
      // 获取filepath, 触发父组件数据更新
      node.name = name
      var filePath = this.getFilePath(node, this)
      var isSelected = this.selNode && this.selNode.id === node.id
      var isDir = node.type === 'dir'
      this.$emit('SaveEdit', name, filePath, isSelected, isDir)
    },
    // 删除节点
    deleteNode: function (node) {
      if (this.selNode && this.selNode.id === node.id) {
        this.selNode = null
      }
      var children = this.$utilHelper.getNode(this.tree, node.id).parentNode.children
      children.forEach((v, i) => {
        if (v.id === node.id) {
          children.splice(i, 1)
        }
      })
      // v-model双向绑定，更新父组件数据
      this.$emit('input', this.tree)
      // 删除节点，触发父节点更新
      var filePath = this.getFilePath(node, this)
      var isSelected = (this.selNode && this.selNode.id === node.id)
      this.$emit('DelNod', filePath, isSelected)
    },
    // 增加文件
    addFlie: function () {
      if (!this.selNode || this.selNode.type !== 'dir') {
        return
      }
      var children = this.$utilHelper.getNode(this.tree, this.selNode.id).node.children
      children.push({
        name: 'newfile',
        id: this.$utilHelper.generateUUID(),
        type: 'file',
        isSelected: false,
        children: []
      })
      this.$utilHelper.childrenSort(children)
      // v-model双向绑定，更新父组件数据
      this.$emit('input', this.tree)
    },
    // 增加文件夹
    addFolder: function () {
      if (!this.selNode || this.selNode.type !== 'dir') {
        return
      }
      var children = this.$utilHelper.getNode(this.tree, this.selNode.id).node.children
      children.push({
        name: 'newfolder',
        id: this.$utilHelper.generateUUID(),
        type: 'dir',
        isSelected: false,
        children: []
      })
      this.$utilHelper.childrenSort(children)
      // v-model双向绑定，更新父组件数据
      this.$http.post(this.$common.address + '/api/users/' + this.$session.get('username') + '/projects/' + this.projectName + '/files/');
      this.$emit('input', this.tree)
    },
    // 获取文件路径
    getFilePath: function (node, that) {
      var parentNode = that.$utilHelper.getNode(that.tree, node.id).parentNode
      var filePath = node.name
      while (parentNode != null) {
        node = parentNode
        filePath = parentNode.name + '/' + filePath
        parentNode = that.$utilHelper.getNode(that.tree, node.id).parentNode
      }
      return filePath
    },
    updateMenuWidth: function (el) {
      this.menuWidth = document.getElementById('file_data').scrollWidth + 'px'
    }
  },
  watch: {
    value: {
      handler: function (val, oldval) {
        console.log(val)
        // 深度复制
        this.tree = JSON.parse(JSON.stringify(val))
      },
      deep: true
    }
  }
}
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
</style>
