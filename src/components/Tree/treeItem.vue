<template>
  <div class="span_item">
    <span>
      <Icon  v-if="node.type == 'dir' && this.treeNode.expanded" type="android-folder-open" color="#009861"></Icon>
      <Icon  v-if="node.type == 'dir' && !this.treeNode.expanded" type="android-folder" color="#009861"></Icon>
      <Icon v-if="node.type == 'file'" type="android-document" color="#009861"></Icon>
      <Input v-if="node.edit_status == 1" style="width: 100px;" v-model="node.name" size="small" @on-enter="onEnter" autofocus></Input>
      <span v-if="node.edit_status == 0" style="color: #009861;">{{ this.node.name }}</span>
    </span>
    <span class="span_icon">
       <Icon v-if="node.edit_status == 0" style="margin-left: 8px" color="gray" type="edit" size="16" @click.native="OpenEdit"></Icon>
       <Icon v-if="node.edit_status == 0" style="margin-left: 8px" type="ios-trash" color="red" size="18" @click.native="Delete"></Icon>
    </span>
  </div>
</template>

<script>
    export default {
      data() {
        return {
          node:this.value,
          nodeData:JSON.parse(JSON.stringify(this.value))
        }
      },
      props:{
        //节点数据对象,即自定义的数据
        value:{
          default: function () {
            return {}
          }
        },
        //node对象
        treeNode:{
          default: function () {
            return {}
          }
        }
      },
      methods:{
        OpenEdit(){
          this.node.edit_status = 1
          this.node.isAdd = false
        },
        Append(){
          //添加节点事件
          this.$emit('Append')
        },
        onEnter(){
          //保存节点事件
          this.$emit('SaveEdit',this.nodeData)
        },
        Delete(){
          this.$emit('Delete',this.nodeData)
        }
      },
      watch:{
        value:{
          handler:function(val,oldVal){
            this.node = val
          },
          deep:true
        },
        node:{
          handler:function(val){
            this.$emit('input',val)
          },
          deep:true
        }
      }
    }
</script>
<style>
  .span_item:hover .span_icon {
    display: inline;
  }
  .span_icon {
    margin-left: 10px;
    display: none;
  }
  .el-tree-node__children {
    overflow: visible !important;
  }
</style>
