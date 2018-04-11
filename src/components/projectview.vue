<template>
    <div id="project_view">
        <div id="structure_buttons">
            <Icon class="control" type="ios-compose" size="20"></Icon>
            <Icon class="control" type="folder" size="20"></Icon>
            <Icon class="control" type="trash-a" size="20"></Icon>
        </div>
        <div id="structure_view">
            <Tree :data="data5" :render="renderContent"></Tree>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                data5: [
                    {
                        title: this.project,
                        expand: true,
                        selected: true,
                        render: (h, { root, node, data }) => {
                            return h('span', {
                                style: {
                                    display: 'inline-block',
                                    width: '100%'
                                }
                            }, [
                                h('span', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-folder-outline'
                                        },
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('span', data.title)
                                ])
                            ]);
                        },
                        children: [
                            {
                                title: 'child 1-1',
                                expand: true,
                                selected: true,
                                children: [
                                    {
                                        title: 'leaf 1-1-1',
                                        expand: true
                                    },
                                    {
                                        title: 'leaf 1-1-2',
                                        expand: true
                                    }
                                ]
                            },
                            {
                                title: 'child 1-2',
                                expand: true,
                                children: [
                                    {
                                        title: 'leaf 1-2-1',
                                        expand: true
                                    },
                                    {
                                        title: 'leaf 1-2-1',
                                        expand: true
                                    }
                                ]
                            }
                        ]
                    }
                ],
                project: 'project',
                folder: [{
                    title: this.project,
                    expand: false,
                    selected: true
                }],
                file: [{
                    title: this.project,
                    expand: false,
                    selected: true
                }]
            }
        },
        methods: {
            renderContent (h, { root, node, data }) {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            props: {
                                type: 'ios-paper-outline'
                            },
                            style: {
                                marginRight: '8px'
                            }
                        }),
                        h('span', data.title)
                    ]),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            float: 'right',
                            marginRight: '32px'
                        }
                    })
                ]);
            },
            append (data) {
                const children = data.children || [];
                children.push({
                    title: 'appended node',
                    expand: true
                });
                this.$set(data, 'children', children);
            },
            remove (root, node, data) {
                const parentKey = root.find(el => el === node).parent;
                const parent = root.find(el => el.nodeKey === parentKey).node;
                const index = parent.children.indexOf(data);
                parent.children.splice(index, 1);
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
    overflow-y: auto;
    overflow-x: auto;
}
.control {
    color:#009A61;
    margin: 0 5px 0 5px;
}
</style>
