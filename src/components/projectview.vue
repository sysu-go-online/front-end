<template>
    <div id="project_view">
        <m-tree ref="tree" v-model="tableTree" @OpenFile="OpenFile" @SaveEdit="SaveEdit" @DelNode="DelNode"></m-tree>
    </div>
</template>

<script>
    import MTree from './Tree/index.vue'
    export default {
        data () {
            return {
                tableTree: [],
                projectId: 1,
                currentFiledata: {}
            }
        },
        components: {
            MTree
        },
        created: function () {
            this.$http.get('/api/1','GET').then(
                Response => {
                    this.tableTree = Response.data
                },
            )
        },
        methods: {
            SaveEdit: function (parentNode,data,next) {
                var data = parentNode
                var filePath = parentNode.name + '/' + data.name
                var parentNode = this.$utilHelper.getNode(this.tableTree, data.id).parentNode
                while (parentNode.name != null) {
                    data = parentNode
                    filePath = parentNode.name + '/' + filePath
                    parentNode = this.$utilHelper.getNode(this.treeData,data.id).parentNode
                }
                this.$http.put('/api/'+ this.projectId + '/tree/' + this.currentFiledata.filepath)
                      .then(Response => {
                          console.log(Response.status)
                      })
                next(true, 0)
            },
            DelNode: function (parentNode,data,next) {
                this.$http.delete('/api/'+ this.projectId + '/tree/' + this.currentFiledata.filepath)
                      .then(Response => {
                          console.log(Response.status)
                      })
                if (this.currentFiledata.nodeData.id == data.id) {
                    this.currentFiledata.name = ''
                    this.currentFiledata.filepath = ''
                    this.$emit('openfile', this.currentFiledata)
                }
                next(true, 0)
            },
            OpenFile: function (file) {
                this.currentFiledata = file
                this.currentFiledata['projectid'] = this.projectId
                this.$emit('openfile', this.currentFiledata)
            }
    }
}
</script>

<style>
#project_view{
    position: absolute;
    left: 50px;
    height: 100%;
    background: #292929;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    display: inline-block;
}
</style>
