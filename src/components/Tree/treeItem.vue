<template>
  <div class="span_item">
    <span @click="Expanded">
      <Icon  v-if="node.type == 'dir' && this.treeNode.expanded" type="android-folder-open" color="#009861"></Icon>
      <Icon  v-if="node.type == 'dir' && !this.treeNode.expanded" type="android-folder" color="#009861"></Icon>
      <Icon v-if="node.type == 'file'" type="android-document" color="#009861"></Icon>
      <Input v-if="node.status == 1" style="width: 100px;" v-model="node.label" size="small"></Input>
      <span v-if="node.status == 0" style="color: #009861;">{{ this.node.label }}</span>
    </span>
    <span v-if="node.status == 1">
      <Button  style="margin-left: 8px;" size="small" type="success" icon="checkmark-circled" @click.native="SaveEdit">确认</Button>
      <Button style="margin-left: 8px;" size="small" type="ghost" icon="checkmark-circled" @click.native="CancelEdit">取消</Button>
    </span>
    <span class="span_icon">
       <Icon v-if="node.status == 0" style="margin-left: 8px" color="gray" type="edit" size="16" @click.native="OpenEdit"></Icon>
       <Icon v-if="node.status == 0" style="margin-left: 8px" type="ios-trash" color="red" size="18" @click.native="Delete"></Icon>
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
          this.node.status = 1
          this.node.isAdd = false
          console.log(this.node)
        },
        Append(){
          //添加节点事件
          this.$emit('Append')
        },
        SaveEdit(){
          //保存节点事件
          this.$emit('SaveEdit',this.nodeData)
        },
        CancelEdit(){
          this.node.status = 0
          this.$emit('CancelEdit',this.nodeData)
        },
        Delete(){
          this.$emit('Delete',this.nodeData)
        },
        Expanded(){
          this.treeNode.expanded = this.treeNode.expanded?false:true
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
