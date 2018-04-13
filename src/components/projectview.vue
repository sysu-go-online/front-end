<template>
    <div id="project_view">
        <m-tree ref="tree" v-model="tableTree" @SaveEdit="SaveEdit" @DelNode="DelNode"></m-tree>
    </div>
</template>

<script>
    import MTree from './Tree/index.vue'
    export default {
        data () {
            return {
                tableTree: [
                    {
                        value: this.$utilHelper.generateUUID(),
                        label:'project',
                        status: 0,
                        type: 'dir',
                        children: [
                            {
                                value: this.$utilHelper.generateUUID(),
                                label: 'include',
                                status: 0,
                                type: 'dir',
                                children: [
                                    {
                                        value: this.$utilHelper.generateUUID(),
                                        label: 'lib.js',
                                        status: 0,
                                        type: 'file'
                                    }
                                ]
                            },
                            {
                                value: this.$utilHelper.generateUUID(),
                                label: 'bin',
                                status: 0,
                                type: 'dir',
                                children: [
                                    {
                                        value: this.$utilHelper.generateUUID(),
                                        label: 'main',
                                        status: 0,
                                        type: 'file'
                                    }
                                ]
                            }
                        ]
                    }
                ],
            }
        },
        components: {
            MTree
        },
        methods: {
            SaveEdit: function (parentNode,data,next) {
                var param = {
                parentNode:parentNode,
                node:data
                }
                next(true, 0)
                console.log("save success!")
            },
            DelNode: function (parentNode,data,next) {
                var param = {
                node:data
                }
                next(true, 0)
                console.log("delete success!")
            }
    }
}
</script>

<style>
#project_view{
    position: absolute;
    left: 0;
    height: 100%;
    width: 10%;
    background: #292929;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    display: inline-block;
}
.func_button{
    background: rgba(17, 17, 17, 0.4);
    color: #009A61;
    margin: 5px;
    padding: 1px;
    font-size: 14px;
    border: solid #009A61 1px;
    border-radius: 5px;
    width: 70px;
    text-align: center;
}
</style>
