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
      projectName: 'undefined'
    };
  },
  components: {
    Tree
  },
  created: function () {
    let that = this;
    this.projectName = this.$route.params.projectname;
    if (this.projectName === undefined) {}
    this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
      headers: {'Authorization': that.$cookie.get('jwt')}
    }).then(Response => {
      var tree = {
        name: Response.data.name,
        id: Response.data.id,
        type: Response.data.type,
        root: Response.data.root,
        isSelected: Response.data.isSelected,
        children: Response.data.children
      };
      this.$utilHelper.formatChildren(tree);
      this.$utilHelper.treeSort(tree);
      console.log(tree);
      this.treeData = tree;
    });
  },
  methods: {
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
            that.currentFiledata.filepath = filePath;
            that.$emit('openfile', that.currentFiledata);
          }
        });
    },
    DelNode: function (filePath, isSelectedNode) {
      let that = this;
      this.$http
        .delete('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + filePath, {
          headers: {'Authorization': that.$cookie.get('jwt')}
        }).then(Response => {
          that.$dialog.alert('删除成功');
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
