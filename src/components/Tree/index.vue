<template>
  <div id="structure">
    <div id="structure_buttons">
      <Icon type="document-text" class="control" size="20" @click.native="appendFile"></Icon>
      <Icon type="folder" class="control" size="20" @click.native="appendDir"></Icon>
    </div>
    <div id="structure_view">
      <el-tree
        class="filter-tree"
        style="width:100%; height: 100%; overflow: auto; background: #292929"
        :data="treeData"
        @node-click="handleNodeClick"
        ref="tree"
        node-key="id"
        :expand-on-click-node="true"
        :render-content="renderContent">
      </el-tree>
    </div>
  </div>
</template>

<script>
  import TreeItem from './treeItem.vue'
  export default {
    data() {
      return {
        treeData:this.value,
        runParam:{},
        selectedNode: {}
      }
    },
    methods: {
      handleNodeClick(nodeData, node, store) {
        this.selectedNode = node
        if (nodeData.type == 'dir'){
          return
        }
        var data = nodeData
        var filePath = nodeData.name
        var parentNode = this.$utilHelper.getNode(this.treeData,data.id).parentNode
        while (parentNode.name != null) {
          data = parentNode
          filePath = parentNode.name + '/' + filePath
          parentNode = this.$utilHelper.getNode(this.treeData,data.id).parentNode
        }
        var file = {
          name: nodeData.name,
          filepath: filePath,
          nodeData: nodeData
        } 
        this.$emit('OpenFile', file)
     },
      //node 树节点，包含data对象(这是它的一个属性)
      //data 树节点数据对象
      //treeStore  包含data对象(这是它的一个属性)
      renderContent(h, { node, data, store }) {
        return h(TreeItem,{
          props:{
            value:data,
            treeNode:node
          },
          on:{
            input:(node)=>{
              data = node
            },
            //删除节点
            Delete: (nodeData) => {
              //递归查找父节点
              var parentNode = this.$utilHelper.getNode(this.treeData,data.id).parentNode
              this.runParam.parentNode = parentNode
              this.runParam.data = data
              this.runParam.nodeData = nodeData
              this.$emit('DelNode',parentNode,data,this.CanDelNext)
            },
            //保存节点
            SaveEdit:(nodeData)=> {
              //递归查找父节点
              var parentNode = this.$utilHelper.getNode(this.treeData,data.id).parentNode
              this.runParam.parentNode = parentNode
              this.runParam.data = data
              this.runParam.nodeData = nodeData
              this.$emit('SaveEdit',parentNode,data,this.CanSaveNext)
            }
          }
        })
      },
      CanSaveNext(isNext,nodeId){
        let parentNode = this.runParam.parentNode
        let nodeData = this.runParam.nodeData
        let data = this.runParam.data
        if(isNext){
          parentNode.children.forEach((v,i)=>{
            if(v.id == data.id){
              data.edit_status = 0
              parentNode.children.splice(i,1,data)
            }
          })
        }else{
          if(!data.isAdd){
            parentNode.children.forEach((v,i)=>{
              if(v.id == nodeData.id){
                data.name = nodeData.name
                parentNode.children.splice(i,1,data)
              }
            })
          }
        }
        this.runParam = {}
      },
      CanDelNext(isNext){
        let parentNode = this.runParam.parentNode
        let nodeData = this.runParam.nodeData
        let data = this.runParam.data
        if(isNext){
          parentNode.children.forEach((v,i)=>{
            if(v.id == data.id){
              parentNode.children.splice(i,1)
            }
          })
        }
        this.runParam = {}
      },
      appendFile: function (){
        if (this.selectedNode.data.type != 'dir'){
          return
        }
        this.$refs.tree.append({
          id: this.$utilHelper.generateUUID(),
          name: '请输入文件名称',
          edit_status: 1,
          type: 'file'
       }, this.selectedNode)
      },
      appendDir: function (){
        if (this.selectedNode.data.type != 'dir'){
          return
        }
        this.$refs.tree.append({
          id:  this.$utilHelper.generateUUID(),
          name: '请输入文件夹名称',
          edit_status: 1,
          type: 'dir',
          children: []
       }, this.selectedNode)
      }
    },
    props:{
      value:Array
    },
    watch:{
      value:{
        handler:function(val,oldVal){
          this.treeData = val
        },
        deep:true
      },
      treeData:{
        handler:function(val){
          this.$emit('input',val)
        },
        deep:true
      }
    },
    components:{
      TreeItem
    }
  }
</script>

<style>
.control {
    color:#009A61;
    margin: 0 10px 0 10px;
}
#structure_buttons {
    position: relative;
    width: 50%; 
    height: 20px;
    margin-left: 50%; 
    margin-top: 10px; 
}
#structure_view {
    position: relative;
    width: 100%;
    height: calc(100% - 30px);
    overflow-y: auto !important;
    overflow-x: auto !important;
}
#structure {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
