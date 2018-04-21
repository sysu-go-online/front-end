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
                projectId: 1
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
                var param = {
                parentNode:parentNode,
                node:data
                }
                next(true, 0)
            },
            DelNode: function (parentNode,data,next) {
                var param = {
                node:data
                }
                next(true, 0)
            },
            OpenFile: function (file) {
                var data = file
                console.log('projectdata--------------------------')
                console.log(data)
                data['projectid'] = this.projectId
                this.$emit('openfile', data)
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
