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
            SaveEdit: function (fileName, filePath, isSelectedNode, isDir, next) {
                var that = this
                this.$http.put('/api/'+ this.projectId + '/tree/' + filePath,
                    {
                      'dir': isDir
                    }).then(Response => {
                        console.log(Response.status)
                        if (isSelectedNode) {
                            that.currentFiledata.name = fileName
                            that.currentFiledata.filepath = filePath
                            that.$emit('openfile', that.currentFiledata)
                        }
                    })
                next()
            },
            DelNode: function (filePath, isSelectedNode, next) {
                this.$http.delete('/api/'+ this.projectId + '/tree/' + filePath)
                      .then(Response => {
                          console.log(Response.status)
                      })
                if (isSelectedNode) {
                    this.currentFiledata.name = ''
                    this.currentFiledata.filepath = ''
                    this.$emit('openfile', this.currentFiledata)
                }
                next()
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
