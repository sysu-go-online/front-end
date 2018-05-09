<template>
    <div id="project_view">
        <tree ref="tree" v-model="treeData" @OpenFile="OpenFile" @SaveEdit="SaveEdit" @DelNode="DelNode"></tree>
    </div>
</template>

<script>
    import Tree from './Tree/tree.vue'
    export default {
        data () {
            return {
                treeData: {},
                projectId: 1,
                currentFiledata: {},
                testData: [{"id":60,"name":".git","edit_status":0,"type":"dir","children":[{"id":61,"name":"HEAD","edit_status":0,"type":"file","children":null},{"id":62,"name":"branches","edit_status":0,"type":"dir","children":null},{"id":63,"name":"config","edit_status":0,"type":"file","children":null},{"id":64,"name":"description","edit_status":0,"type":"file","children":null},{"id":65,"name":"hooks","edit_status":0,"type":"dir","children":[{"id":66,"name":"applypatch-msg.sample","edit_status":0,"type":"file","children":null},{"id":67,"name":"commit-msg.sample","edit_status":0,"type":"file","children":null},{"id":68,"name":"post-update.sample","edit_status":0,"type":"file","children":null},{"id":69,"name":"pre-applypatch.sample","edit_status":0,"type":"file","children":null},{"id":70,"name":"pre-commit.sample","edit_status":0,"type":"file","children":null},{"id":71,"name":"pre-push.sample","edit_status":0,"type":"file","children":null},{"id":72,"name":"pre-rebase.sample","edit_status":0,"type":"file","children":null},{"id":73,"name":"prepare-commit-msg.sample","edit_status":0,"type":"file","children":null},{"id":74,"name":"update.sample","edit_status":0,"type":"file","children":null}]},{"id":75,"name":"index","edit_status":0,"type":"file","children":null},{"id":76,"name":"info","edit_status":0,"type":"dir","children":[{"id":77,"name":"exclude","edit_status":0,"type":"file","children":null}]},{"id":78,"name":"logs","edit_status":0,"type":"dir","children":[{"id":79,"name":"HEAD","edit_status":0,"type":"file","children":null},{"id":80,"name":"refs","edit_status":0,"type":"dir","children":[{"id":81,"name":"heads","edit_status":0,"type":"dir","children":[{"id":82,"name":"master","edit_status":0,"type":"file","children":null}]},{"id":83,"name":"remotes","edit_status":0,"type":"dir","children":[{"id":84,"name":"origin","edit_status":0,"type":"dir","children":[{"id":85,"name":"HEAD","edit_status":0,"type":"file","children":null}]}]}]}]},{"id":86,"name":"objects","edit_status":0,"type":"dir","children":[{"id":87,"name":"info","edit_status":0,"type":"dir","children":null},{"id":88,"name":"pack","edit_status":0,"type":"dir","children":[{"id":89,"name":"pack-67e87178943bef620a1a2a74feb6d1f2f06fbe28.idx","edit_status":0,"type":"file","children":null},{"id":90,"name":"pack-67e87178943bef620a1a2a74feb6d1f2f06fbe28.pack","edit_status":0,"type":"file","children":null}]}]},{"id":91,"name":"packed-refs","edit_status":0,"type":"file","children":null},{"id":92,"name":"refs","edit_status":0,"type":"dir","children":[{"id":93,"name":"heads","edit_status":0,"type":"dir","children":[{"id":94,"name":"master","edit_status":0,"type":"file","children":null}]},{"id":95,"name":"remotes","edit_status":0,"type":"dir","children":[{"id":96,"name":"origin","edit_status":0,"type":"dir","children":[{"id":97,"name":"HEAD","edit_status":0,"type":"file","children":null}]}]},{"id":98,"name":"tags","edit_status":0,"type":"dir","children":null}]}]},{"id":99,"name":".gitignore","edit_status":0,"type":"file","children":null},{"id":100,"name":".travis.yml","edit_status":0,"type":"file","children":null},{"id":101,"name":"Dockerfile","edit_status":0,"type":"file","children":null},{"id":102,"name":"ISSUE_TEMPLATE.md","edit_status":0,"type":"file","children":null},{"id":103,"name":"LICENSE","edit_status":0,"type":"file","children":null},{"id":104,"name":"Readme.md","edit_status":0,"type":"file","children":null},{"id":105,"name":"TODO","edit_status":0,"type":"file","children":null},{"id":106,"name":"controller","edit_status":0,"type":"dir","children":[{"id":107,"name":"handler.go","edit_status":0,"type":"file","children":null},{"id":108,"name":"service.go","edit_status":0,"type":"file","children":null},{"id":109,"name":"type.go","edit_status":0,"type":"file","children":null}]},{"id":110,"name":"main.go","edit_status":0,"type":"file","children":null},{"id":111,"name":"model","edit_status":0,"type":"dir","children":[{"id":112,"name":"entities","edit_status":0,"type":"dir","children":[{"id":113,"name":"entities.go","edit_status":0,"type":"file","children":null},{"id":114,"name":"init.go","edit_status":0,"type":"file","children":null}]},{"id":115,"name":"service","edit_status":0,"type":"dir","children":[{"id":116,"name":"service.go","edit_status":0,"type":"file","children":null}]}]},{"id":117,"name":"router","edit_status":0,"type":"dir","children":[{"id":118,"name":"router.go","edit_status":0,"type":"file","children":null}]}]
            }
        },
        components: {
            Tree
        },
        created: function () {
            this.$http.get('http://120.79.0.17/api/1','GET').then(
                Response => {
                    var tree = Response.data
                    this.$utilHelper.formatChildren(tree)
                    this.$utilHelper.treeSort(tree)
                    this.treeData = tree
                },
            )
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
            },
            DelNode: function (filePath, isSelectedNode) {
                this.$http.delete('/api/'+ this.projectId + '/tree/' + filePath)
                      .then(Response => {
                          console.log(Response.status)
                      })
                if (isSelectedNode) {
                    this.currentFiledata.name = ''
                    this.currentFiledata.filepath = ''
                    this.$emit('openfile', this.currentFiledata)
                }
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
    font-size: 18px;
}
</style>
