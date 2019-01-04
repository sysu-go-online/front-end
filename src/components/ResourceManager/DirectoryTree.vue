<template>
  <div id='directoryTree' @contextmenu.prevent='showMenu'>
    <tree :data="treeData" :render="renderFolder" ref='rootTree'></tree>
    <vue-context ref='menu' id='contextMenu'>
      <ul>
        <li @click='addFile'>新建文件</li>
        <li @click='addFolder'>新建文件夹</li>
        <li @click='renameNode' v-show='this.isClickNode'>重命名</li>
        <li @click='deleteNode' v-show='this.isClickNode'>删除</li>
      </ul>
    </vue-context>
  </div>
</template>

<script>
import { VueContext } from 'vue-context';
import { mapGetters, mapActions } from 'vuex';
import eventBus from '../../util/eventBus.js';

export default {
  name: 'DirectoryTree',
  data () {
    return {
      ws: null,
      treeData: [],
      rootNode: {},
      isClickNode: false,
      renamingNode: null,
      newName: '',
      deleting: false,
      adding: false,
      updating: false,
      openEditor: false
    };
  },
  computed: {
    ...mapGetters(['projectName', 'currentFilepath', 'openFilepathOrder', 'openFiles'])
  },
  components: {
    'vue-context': VueContext
  },
  methods: {
    ...mapActions(['setProjectName', 'setCurrentFilepath', 'setOpenFilepathOrder', 'setOpenFiles']),
    // 初始化WebSocket服务
    initWebSocket () {
      // let hostname = window.location.hostname;
      let hostname = 'go-online.heartublade.com';
      this.ws = new WebSocket('ws://' + hostname + '/api/ws/dir');
      let that = this;
      this.ws.onopen = function (evt) {
        console.log('文件树WS已连接');
        // console.log(that.ws);
        that.ws.send(JSON.stringify({
          'jwt': that.$cookie.get('jwt'),
          'project': that.projectName
        }));
      };
      this.ws.onmessage = function (evt) {
        // console.log(evt);
        let data = JSON.parse(evt.data);
        // console.log(data);
        // 若为有效信息
        if (data.ok) {
          // console.log(data.state);
          // console.log("current tree", that.treeData);
          // console.log('WS update');
          // console.log("changed path", data.path);
          if (data.state === -1) { // 文件夹监听成功
            // 暂时不用处理
          } else if (data.state === 0) { // 文件被创建
            if (!that.adding && !that.updating && !that.renamingNode) {
              let changedNode = that.getNodeByPath(data.path);
              // console.log('aim', data.path);
              // console.log('rootNode', that.rootNode);
              // console.log('create by ws');
              // console.log('fuck node', changedNode);
              if (!changedNode) {
                that.addNode(data.path, data.type);
              }
            }
          } else if (data.state === 1) { // 文件被删除
            if (!that.deleting && !that.updating) {
              let changedNode = that.getNodeByPath(data.path);
              if (changedNode) {
                that.deleteNodeLocal(changedNode);
              }
            }
          } else if (data.state === 2) { // 文件被修改
            // 保存/重命名
            // that.getTree();
          } else if (data.state === 3) { // 文件从此处被移动走
            // that.getTree();
          } else if (data.state === 4) { // 文件被移动到此处
            // that.getTree();
          } else { // 5:未定义行为

          }
        }
      };
      this.ws.onclose = function () {
        console.log('文件树WS已关闭');
        console.log('文件树WS正在重新连接');
        that.initWebSocket();
      };
    },
    // 本地格式化服务器传回的树
    // 修改路径为(projectName/)../../file
    formatRawNode (node, level = 0, parentPath = '') {
      // 1.修改图片文件的type为image
      // 2.添加路径属性
      if (level === 0) {
        node.path = '';
      } else if (level === 1) {
        node.path = node.name;
      } else {
        node.path = parentPath + '/' + node.name;
      }
      node.selected = false;
      node.rename = false;
      if (node.type === 'file') {
        node.render = this.renderFile;
        let part = node.name.split('.');
        // 有后缀
        if (part.length !== 1) {
          let suffix = part[part.length - 1];
          if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg' || suffix === 'bmp' || suffix === 'gif') {
            node.type = 'image';
            node.render = this.renderImage;
          }
        }
      } else {
        node.type = 'folder';
        node.expand = level === 0;
        node.render = this.renderFolder;
        if (node.children) { // 文件夹则递归处理子文件
          level++;
          let num = node.children.length;
          for (let i = 0; i < num; i++) {
            this.formatRawNode(node.children[i], level, node.path);
          }
        } else {
          node.children = [];
        }
      }
      return node;
    },
    syncTree () {
      // TODO：旧状态的处理
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files', {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log('original', Response);
        var tree = this.formatRawNode(JSON.parse(JSON.stringify(Response.data)));
        this.treeData = [tree];
        // console.log(this.treeData);
      });
    },
    clickHandler (node) {
      if (!this.renamingNode) {
        this.selectNode(node);
      } else if (node.node.nodeKey !== this.renamingNode.nodeKey) {
        this.checkName();
        this.selectNode(node);
      }
    },
    renderContent (h, { root, node, data }, iconType) {
      return h('span', {
        class: {
          selected: node.node.selected,
          fileRow: true
        },
        style: {
          display: 'inline-block',
          width: '90%',
          'padding-left': '5px',
          'text-align': 'left',
          'font-size': '15px'
        },
        on: {
          click: () => { this.clickHandler(node); },
          contextmenu: () => { this.clickHandler(node); }
        }
      }, [
        h('span', {
          style: {
            display: 'inline-block',
            width: '100%'
          }
        }, [
          h('Icon', {
            props: {
              type: iconType
            },
            style: {
              marginRight: '8px',
              height: '100%'
            }
          }),
          h('span', {
            domProps: {
              innerHTML: data.name
            },
            class: {
              hide: data.rename
            }
          }),
          h('input', {
            class: {
              hide: !data.rename,
              inputName: true
            },
            domProps: {
              type: 'text',
              autofocus: 'autofocus',
              value: data.name
            },
            on: {
              input: (event) => {
                this.newName = event.target.value;
              },
              keyup: (event) => {
                // 回车
                if (event.which === 13) {
                  this.checkName();
                }
              }
            }
          })
        ])
      ]);
    },
    renderFolder (h, { root, node, data }) {
      this.rootNode = root;
      let iconType = 'ios-folder-outline';
      return this.renderContent(h, { root, node, data }, iconType);
    },
    renderFile (h, { root, node, data }) {
      // console.log('file', data.name);
      this.rootNode = root;
      let iconType = 'ios-paper-outline';
      return this.renderContent(h, { root, node, data }, iconType);
    },
    renderImage (h, { root, node, data }) {
      this.rootNode = root;
      let iconType = 'ios-image-outline';
      return this.renderContent(h, { root, node, data }, iconType);
    },
    // 根据节点相对根目录路径获取节点
    getNodeByPath (path) {
      return this.rootNode.find(el => el.node.path === path);
    },
    getNodeByKey (key) {
      return this.rootNode.find(el => el.nodeKey === key);
    },
    selectNodeByPath (path) {
      // console.log(path);
      // console.log('switch');
      if (path) {
        this.selectNode(this.getNodeByPath(path));
      } else {
        let lastNode = this.$refs.rootTree.getSelectedNodes()[0];
        if (lastNode) {
          // 失活上一节点
          lastNode.selected = false;
        }
        this.openEditor = false;
        eventBus.$emit('closeEditor');
      }
    },
    selectNode (node) {
      // console.log('select node', node);
      // TOFIX：未定位BUG，临时性修复
      if (!this.$refs.rootTree) return;
      let lastNode = this.$refs.rootTree.getSelectedNodes()[0];
      if (lastNode) {
        // 选中同一节点，不处理
        if (lastNode.path === node.node.path) return;
        // 失活上一节点
        lastNode.selected = false;
      }
      // 激活新节点
      node.node.selected = true;
      if (node.node.type !== 'folder') {
        // 所有文件打开的顺序
        // 数组深复制，存储path
        var newOrder = this.openFilepathOrder.concat();
        // 已打开文件的信息，由path进行索引
        var localOpenFiles = JSON.parse(JSON.stringify(this.openFiles));
        // 若已打开，则调整文件打开顺序，同时更新激活状态
        // console.log(newOrder);
        let index = newOrder.indexOf(node.node.path);
        // console.log(index);
        if (index !== -1) {
          newOrder.splice(index, 1);
          localOpenFiles[node.node.path].selected = true;
        } else {
          // 未打开编辑器窗口则打开
          if (!this.openEditor) {
            this.openEditor = true;
            eventBus.$emit('openEditor');
          }
          var newTab = {
            name: node.node.name,
            type: node.node.type,
            path: node.node.path,
            selected: true,
            dirty: false,
            showPath: false,
            pathToShow: ''
          };
          localOpenFiles[node.node.path] = newTab;
          // console.log(newTab);
        }
        newOrder.push(node.node.path);
        if (lastNode) {
          // 未关闭上一节点，则失活上一节点
          if (localOpenFiles[lastNode.path]) {
            localOpenFiles[lastNode.path].selected = false;
          }
        }
        // 更新vuex数据
        this.setOpenFilepathOrder({'openFilepathOrder': newOrder});
        this.setOpenFiles({'openFiles': localOpenFiles});
        this.setCurrentFilepath({'currentFilepath': node.node.path});
      }
    },
    getChildrenSet () {
      let currentNode = this.$refs.rootTree.getSelectedNodes()[0];
      // console.log(currentNode);
      var children = {};
      if (currentNode) {
        // 若当前节点是文件夹，则直接在其下添加
        if (currentNode.type === 'folder') {
          children = currentNode.children;
        } else { // 否则，在其父节点下添加
          let parentKey = this.getNodeByKey(currentNode.nodeKey).parent;
          children = this.getNodeByKey(parentKey).node.children;
        }
      } else { // 当前未选中任何节点，默认在根节点下添加
        children = this.getNodeByKey(0).node.children;
      }
      // console.log(children);
      return children;
    },
    getRandomName () {
      let date = new Date();
      let y = date.getFullYear();
      let mo = date.getMonth();
      let d = date.getDay();
      let h = date.getHours();
      let mi = date.getMinutes();
      let s = date.getSeconds();
      let r = Math.round(Math.random() * 100);
      var name = '' + y + mo + d + h + mi + s + r;
      return name;
    },
    // TODO: 添加命名规则
    addFile () {
      if (!this.adding) {
        this.adding = true;
        let name = this.getRandomName();
        let children = this.getChildrenSet();
        let lastNode = this.$refs.rootTree.getSelectedNodes()[0];
        let relativePath = '';
        // console.log(lastNode);
        if (lastNode) {
          if (lastNode.type === 'folder') {
            relativePath = lastNode.path + '/';
          } else {
            relativePath = lastNode.path.slice(0, -lastNode.name.length);
          }
        }
        // 在根目录创建时特殊处理，防止和根目录路径一样
        if (!relativePath) {
          relativePath = '/';
        }
        var newNode = {
          name: '',
          type: 'file',
          path: relativePath,
          selected: false,
          rename: true,
          render: this.renderFile
        };
        children.push(newNode);
        this.renamingNode = newNode;
      }
    },
    addFolder () {
      if (!this.adding) {
        this.adding = true;
        let name = this.getRandomName();
        let children = this.getChildrenSet();
        let lastNode = this.$refs.rootTree.getSelectedNodes()[0];
        let relativePath = '';
        // console.log(lastNode);
        if (lastNode) {
          if (lastNode.type === 'folder') {
            relativePath = lastNode.path + '/';
          } else {
            relativePath = lastNode.path.slice(0, -lastNode.name.length);
          }
        }
        if (!relativePath) {
          relativePath = '/';
        }
        var newNode = {
          name: '',
          type: 'folder',
          path: relativePath,
          expand: true,
          selected: false,
          rename: true,
          render: this.renderFolder,
          children: []
        };
        children.push(newNode);
        this.renamingNode = newNode;
      }
    },
    // 本地添加节点：用于服务端添加而本地未添加时
    // 假定上一级目录已存在
    addNode (path, type, renderFun = this.renderFile) {
      // 组装node
      var node = {
        selected: false,
        rename: false,
        path: path
      };
      let part = path.split('/');
      node.name = part.pop();
      if (type !== 'folder') {
        let suffix = node.name.split('.').pop();
        if (suffix === 'png' || suffix === 'jpg' || suffix === 'jpeg' || suffix === 'bmp' || suffix === 'gif') {
          type = 'image';
          renderFun = this.renderImage;
        }
      } else {
        renderFun = this.renderFolder;
        node.expand = false;
        node.children = [];
      }
      node.type = type;
      node.render = renderFun;
      // 寻找父节点的孩子集
      let children;
      if (part.length === 0) {
        children = this.getNodeByKey(0).node.children;
      } else {
        children = this.getNodeByPath(part.join('/')).node.children;
      }
      children.push(node);
    },
    renameNode () {
      let currentNode = this.$refs.rootTree.getSelectedNodes()[0];
      this.renamingNode = currentNode;
      currentNode.rename = true;
    },
    checkIsRenaming (event) {
      if (this.renamingNode) {
        this.checkName();
      }
    },
    checkName () {
      let hasSame = false;
      // 新建文件/已存在的文件重命名
      if (this.adding || (this.newName && this.newName !== this.renamingNode.name)) {
        // 新建文件空名字，则取消新建文件
        if (this.adding && !this.newName) {
          this.resetState(true);
          return;
        }
        let parentKey = this.rootNode.find(el => el.nodeKey === this.renamingNode.nodeKey).parent;
        let sibling = this.rootNode.find(el => el.nodeKey === parentKey).node.children;
        let that = this;
        sibling.forEach(function (node) {
          if (node.name === that.newName && node.nodeKey !== that.renamingNode.nodeKey) {
            hasSame = true;
          }
        });
        if (!hasSame) {
          // 新建文件
          if (this.adding) {
            this.renamingNode.name = this.newName;
            this.renamingNode.path += this.newName;
            this.updating = true;
            this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + this.renamingNode.path, {
              'dir': this.renamingNode.type === 'folder'
            }, {
              headers: {
                'Authorization': this.$cookie.get('jwt'),
                'Content-Type': 'application/json'
              }
            }).then(Response => {
              this.$nextTick(() => {
                this.updating = false;
              });
              this.resetState();
            }).catch(() => {
              this.resetState(true);
              // TODO：说明具体原因？
              this.updating = false;
              this.$Message.error('创建失败');
            });
          } else { // 重命名
            let relativeOldPath = this.renamingNode.path;
            let relativeNewPath = relativeOldPath.slice(0, -this.renamingNode.name.length) + this.newName;
            // console.log('old', relativeOldPath);
            // console.log('new', relativeNewPath);
            this.updaing = true;
            this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativeOldPath, {
              'operation': 'rename',
              'content': relativeNewPath
            }, {
              headers: {'Authorization': this.$cookie.get('jwt')}
            }).then(Response => {
              this.renamingNode.name = this.newName;
              this.renamingNode.path = relativeNewPath;
              // 若已打开该文件，则通知编辑器也同步改名
              let newOrder = this.openFilepathOrder.concat();
              // console.log(newOrder);
              let index = newOrder.indexOf(relativeOldPath);
              if (index !== -1) {
                var localOpenFiles = JSON.parse(JSON.stringify(this.openFiles));
                localOpenFiles[relativeNewPath] = {
                  name: this.newName,
                  type: localOpenFiles[relativeOldPath].type,
                  path: relativeNewPath,
                  selected: localOpenFiles[relativeOldPath].selected,
                  dirty: localOpenFiles[relativeOldPath].dirty
                };
                delete localOpenFiles[relativeOldPath];
                newOrder[index] = relativeNewPath;
                eventBus.$emit('renameTab', relativeNewPath, relativeOldPath);
                this.setOpenFiles({'openFiles': localOpenFiles});
                this.setOpenFilepathOrder({'openFilepathOrder': newOrder});
                if (relativeOldPath === this.currentFilepath) {
                  this.setCurrentFilepath({'currentFilepath': relativeNewPath});
                }
              }
              this.$nextTick(() => {
                this.updating = false;
              });
              this.resetState();
              this.$Message.success('重命名成功');
            }).catch((err) => {
              console.log(err);
              this.updating = false;
              this.resetState();
              this.$Message.warning('重命名失败，请稍后再试');
            });
          }
        } else {
          this.$Message.error('存在名字冲突');
          this.resetState(true);
        }
      } else {
        this.resetState();
      }
    },
    resetState (failed = false) {
      if (this.adding) {
        // 创建失败，删除本地节点
        if (failed) {
          let newNode = this.getNodeByPath(this.renamingNode.path);
          this.deleteNodeLocal(newNode);
        }
        // 过滤ws的请求
        this.$nextTick(() => {
          this.adding = false;
        });
      }
      this.renamingNode.rename = false;
      this.newName = '';
      this.renamingNode = null;
    },
    // 递归关闭文件夹内已打开的文件标签
    deleteFolder (node) {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].type === 'folder') {
          if (node.children[i].children.length) {
            this.deleteFolder(node.children[i]);
          }
        } else {
          this.closeTab(node.children[i].path);
        }
      }
    },
    closeTab (path) {
      let index = this.openFilepathOrder.indexOf(path);
      if (index !== -1) {
        eventBus.$emit('closeTab', path);
      }
    },
    // 默认删除当前选中的节点
    deleteNode (event, node = this.$refs.rootTree.getSelectedNodes()[0]) {
      this.$Modal.confirm({
        title: '确定删除文件：' + node.name + '？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          let relativePath = node.path;
          this.deleting = true;
          this.updating = true;
          this.$http.delete('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
            headers: {'Authorization': this.$cookie.get('jwt')}
          }).then(Response => {
            this.deleteNodeLocal(node);
            this.$nextTick(() => {
              this.deleting = false;
              this.updating = false;
            });
            this.$Message.success('删除成功');
          }).catch(() => {
            this.deleting = false;
            this.updating = false;
            this.$Message.error('删除失败');
          });
        },
        onCancel: () => {}
      });
    },
    deleteNodeLocal (node) {
      let parentKey = this.rootNode.find(el => el.nodeKey === node.nodeKey).parent;
      // console.log(parentKey);
      let children = this.rootNode.find(el => el.nodeKey === parentKey).node.children;
      // 若是文件夹，则检查其子文件是否已打开，打开则关闭标签
      if (node.type === 'folder') {
        if (node.children.length) {
          this.deleteFolder(node);
        }
      } else {
        this.closeTab(node.path);
      }
      children.splice(children.indexOf(node), 1);
    },
    showMenu (event) {
      // 未选中任何节点时，禁用重命名/删除操作
      this.isClickNode = !!this.$refs.rootTree.getSelectedNodes()[0];
      this.$refs.menu.open(event);
    }
  },
  created () {
    this.setProjectName({'projectName': this.$route.params.projectname});
    this.syncTree();
    this.initWebSocket();
    eventBus.$on('addFile', this.addFile);
    eventBus.$on('addFolder', this.addFolder);
    eventBus.$on('syncTree', this.syncTree);
    eventBus.$on('switchNode', this.selectNodeByPath);
    eventBus.$on('checkIsRenaming', this.checkIsRenaming);
  },
  beforeDestroy () {
    this.ws.close();
  }
};
</script>

<style>
.selected {
  background-color: #2C313A;
}
#directoryTree {
  position: absolute;
  overflow: auto;
  height: 100%;
  width: 100%;
}
/* 自定义滚动条  */
#directoryTree::-webkit-scrollbar {
  width: 10px;
  opacity: 0;
}
#directoryTree::-webkit-scrollbar-thumb {
  opacity: 0.5;
  background-color: #323842;
}
#directoryTree::-webkit-scrollbar-thumb:hover {
  background-color: #3D4450;
}
#directoryTree::-webkit-scrollbar-track {
  display: none;
}

.fileRow:hover {
  background-color: #292D35;
  cursor: pointer;
}
#contextMenu {
  width: 130px;
  background-color: #21252B;
  border-bottom: 2px solid #000;
  border-top: 0px;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
}
#contextMenu:focus {
  outline: 0;
}
#contextMenu li {
  text-align: center;
  padding: 5px;
}
#contextMenu li:hover {
  background-color: #2C313A;
}
.hide {
  display: none;
}
.inputName {
  width: 80%;
  background-color: #1D1F23;
  border: 1px solid #464646;
  color: #C7C7C7;
}
.inputName:focus {
  outline: 0;
}
</style>
