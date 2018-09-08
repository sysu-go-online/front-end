<template>
  <div id="project_view">
    <tree ref="tree" v-model="treeData" @OpenFile="OpenFile" @SaveEdit="SaveEdit" @DelNode="DelNode"></tree>
  </div>
</template>

<script>
import Tree from './Tree/tree.vue';
export default {
  data () {
    return {
      treeData: {},
      projectId: 0,
      currentFiledata: {},
      projectName: 'app',
    };
  },
  components: {
    Tree
  },
  created: function () {
    console.log(this.$route);
    this.projectName = this.$route.params.projectname;
    if (this.projectName == undefined) {}
    this.$http.get('/api/users/' + this.$session.get('username') + '/projects/' + this.projectName + '/files', 'GET').then(Response => {
      // var tree = Response.data
      // this.$utilHelper.formatChildren(tree)
      // this.$utilHelper.treeSort(tree)
      // this.treeData = tree

      var tree = {
        name: this.projectName,
        id: this.projectId,
        type: 'dir',
        root: true,
        isSelected: false,
        children: Response.data
      };
      this.$utilHelper.formatChildren(tree);
      this.$utilHelper.treeSort(tree);
      this.treeData = tree;
    });
    // var tree = {
    //     name: 'app',
    //     id: this.$utilHelper.generateUUID(),
    //     type: 'dir',
    //     root: true,
    //     isSelected: false,
    //     children: this.testData
    // }
    // this.$utilHelper.formatChildren(tree)
    // this.$utilHelper.treeSort(tree)
    // this.treeData = tree
  },
  methods: {
    SaveEdit: function (fileName, filePath, isSelectedNode, isDir) {
      var that = this;
      filePath = filePath.substring(4, filePath.length);
      this.$http
        .put('/api/users' + this.$session.get('username') + this.projectId + '/tree/' + filePath, {
          dir: isDir
        })
        .then(Response => {
          console.log(Response.status);
          if (isSelectedNode) {
            that.currentFiledata.name = fileName;
            that.currentFiledata.filepath = filePath;
            that.$emit('openfile', that.currentFiledata);
          }
        });
    },
    DelNode: function (filePath, isSelectedNode) {
      filePath = filePath.substring(4, filePath.length);
      this.$http
        .delete('/api/users' + this.$session.get('username') + this.projectId + '/tree/' + filePath)
        .then(Response => {
          console.log(Response.status);
        });
      if (isSelectedNode) {
        this.currentFiledata.name = '';
        this.currentFiledata.filepath = '';
        this.$emit('openfile', this.currentFiledata);
      }
    },
    OpenFile: function (file) {
      this.currentFiledata = file;
      this.currentFiledata['projectid'] = this.projectId;
      this.$emit('openfile', this.currentFiledata, this.projectName);
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
