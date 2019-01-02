<template>
  <layout id='innerEditor'>
    <i-header id='tabBar'>
      <div id='tabs'>
        <span v-for="file in this.tabOrder" :key=file.path :class="['tab', {active: file.selected}]" @click='switchFile(file.path)'>
          <span class='tabName'>{{ file.name }}</span>
          <!-- <Icon class='tabIcon dirtyIcon' type='ios-radio-button-on' /> -->
          <span class='touchArea' @click.stop='checkDirty(file.path)'>
            <Icon class='tabIcon' :type='iconState[file.path]' @mouseover.native='showClose(file.path)' @mouseout.native='showDirty(file.path, file.dirty)' />
          </span>
        </span>
      </div>
    </i-header>
    <i-content id='innerEditorContainer'>
      <div id="editArea" v-show="!this.showPicture" @keyup.ctrl.83.stop="save" @keydown.ctrl.83.prevent>
        <MonacoEditor
          class="editor"
          v-model="currentCode"
          :language="language"
          theme="vs-dark"
          :options='editorOptions'
          ref="editor"
        />
      </div>
      <div id="imgArea" v-show="this.showPicture">
        <div id='imgBox'>
          <img :src="this.imgUrl" />
        </div>
      </div>
    </i-content>
  </layout>
</template>

<script>
import MonacoEditor from 'vue-monaco';
import {mapGetters, mapActions} from 'vuex';
import eventBus from '../util/eventBus.js';

export default {
  name: 'Editor',
  data () {
    return {
      showPicture: false,
      imgUrl: '',
      currentFile: null,
      // 当前文件的代码
      currentCode: '',
      // 已打开的文件代码，path进行索引
      openCodes: {},
      // 打开文件的服务器代码，用于对比
      originalCodes: {},
      // 标签的显示顺序
      tabOrder: [],
      // 标签图标的状态
      iconState: {},
      // Monaco设置
      language: 'go',
      editorOptions: {
        readOnly: true,
        code: 'Welcome to Go-online! \n',
        sutomaticLayout: true
      }
    };
  },
  computed: {
    ...mapGetters(['projectName', 'currentFilepath', 'openFiles', 'openFilepathOrder'])
  },
  components: {
    MonacoEditor
  },
  methods: {
    ...mapActions(['setCurrentFilepath', 'setOpenFilepathOrder', 'setOpenFiles']),
    // 标签的图标切换
    showClose (path) {
      this.iconState[path] = 'md-close';
      this.$forceUpdate();
    },
    showDirty (path, dirty) {
      if (dirty) {
        this.iconState[path] = 'ios-radio-button-on';
        this.$forceUpdate();
      }
    },
    // 从目录树改名时，同步标签栏改名
    syncName (newPath, oldPath) {
      let tab = this.tabOrder.find(el => el.path === oldPath);
      tab.path = newPath;
      tab.name = newPath.split('/').pop();
      delete this.iconState[oldPath];
      this.showClose(newPath);
      this.showDirty(newPath, tab.dirty);
      if (!this.showPicture) {
        // 更新本地代码索引
        delete this.openCodes[oldPath];
        this.openCodes[newPath] = this.currentCode;
        // 更新服务器代码索引
        let code = this.originalCodes[oldPath];
        delete this.originalCodes[oldPath];
        this.originalCodes[newPath] = code;
      }
    },
    switchFile (path) {
      eventBus.$emit('switchNode', path);
    },
    getFile () {
      // 图片文件
      if (this.showPicture) {
        this.currentCode = '';
        // let hostname = window.location.hostname;
        // 测试用
        let hostname = 'go-online.heartublade.com';
        this.$http.get('http://image.' + hostname + '/' + this.$cookie.get('username') + '/' + this.currentFilepath, {
          headers: {
            'Authorization': this.$cookie.get('jwt')
          },
          // withCredentials:true,
          responseType: 'arraybuffer'
        }).then(Response => {
          // console.log(Response);
          let suffix = this.currentFilepath.split('.').pop();
          // 待测试
          this.imgUrl = 'data:image/' + suffix + ';base64,' + btoa(new Uint8Array(Response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        }).catch(() => {
          this.$Message.warning('太大啦！');
        });
      } else if (this.openCodes[this.currentFilepath]) { // 已打开过则直接从缓存中读取
        this.currentCode = this.openCodes[this.currentFilepath];
      } else { // 无缓存则从服务器获取
        this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + this.currentFilepath, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          this.currentCode = Response.data.toString();
          this.openCodes[this.currentFilepath] = this.currentCode;
          this.originalCodes[this.currentFilepath] = this.currentCode;
          // this.$forceUpdate();
        }).catch(() => {
          this.$Message.error('获取文件内容失败，请刷新页面');
        });
      }
    },
    checkDirty (path) {
      // console.log('check path', path);
      let tab = this.tabOrder.find(el => el.path === path);
      // console.log('check tab', tab);
      if (tab.dirty) {
        this.$Modal.confirm({
          title: '是否要保存对' + tab.name + '的更改？',
          content: '如果不保存，更改将丢失',
          okText: '保存',
          cancelText: '不保存',
          closable: true,
          onOk: () => {
            this.save(path, true);
          },
          onCancel: () => {
            this.closeTab(path);
          }
        });
      } else {
        this.closeTab(path);
      }
    },
    // close用于判断保存后是否关闭该标签
    save (path, close = false) {
      // 快捷键调用时，传入的是事件，默认保存当前文件
      if (typeof (path) !== 'string') {
        path = this.currentFilepath;
      }
      console.log('save', path);
      if (path === this.currentFilepath) {
        this.openCodes[path] = this.currentCode;
      }
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + path, {
        'operation': 'update',
        'content': this.openCodes[path] // 不一定是当前文件
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        this.originalCodes[path] = this.openCodes[path];
        this.tabOrder.find(el => el.path === path).dirty = false;
        if (path === this.currentFilepath) {
          this.currentFile.dirty = false;
        }
        this.$Message.success('保存成功');
        if (close) {
          this.closeTab(path);
        } else {
          this.showClose(path);
        }
      }).catch((err) => {
        console.log(err);
        this.$Message.error('保存失败，请稍后再试');
      });
    },
    closeTab (path) {
      // console.log('close path', path);
      // console.log('currentFilepath', this.currentFilepath);
      // 清空相关记录
      // 回溯打开上一文件，故不用清除currentCode
      delete this.iconState[path];
      delete this.openCodes[path];
      delete this.originalCodes[path];
      let tab = this.tabOrder.find(el => el.path === path);
      let index = this.tabOrder.indexOf(tab);
      this.tabOrder.splice(index, 1);
      let pathOrder = this.openFilepathOrder.concat();
      let openFiles = JSON.parse(JSON.stringify(this.openFiles));
      if (path === this.currentFilepath) {
        // console.log('tabOrder', this.tabOrder);
        delete openFiles[pathOrder.pop()];
        // console.log('newOrder', pathOrder);
        // console.log('newOpenFiles', openFiles);
        let nextPath = pathOrder[pathOrder.length - 1];
        this.setOpenFilepathOrder({'openFilepathOrder': pathOrder});
        this.setOpenFiles({'openFiles': openFiles});
        this.setCurrentFilepath({'currentFilepath': ''});
        // console.log('next', nextPath);
        this.switchFile(nextPath);
      } else {
        pathOrder.splice(pathOrder.indexOf(path), 1);
        delete openFiles[path];
        this.setOpenFilepathOrder({'openFilepathOrder': pathOrder});
        this.setOpenFiles({'openFiles': openFiles});
      }
    }
  },
  watch: {
    currentFilepath: function (newPath, oldPath) {
      if (!newPath) {
        this.currentCode = '';
        this.currentFile = null;
        this.editorOptions.readOnly = true;
      } else {
        if (this.editorOptions.readOnly) {
          this.editorOptions.readOnly = false;
        }
        this.currentFile = JSON.parse(JSON.stringify(this.openFiles[newPath]));
        this.showPicture = this.currentFile.type === 'image';
        // 若已存在标签，则修改激活状态
        let oldTab = this.tabOrder.find(el => el.path === oldPath);
        let newTab = this.tabOrder.find(el => el.path === newPath);
        // console.log('oldTab', oldTab);
        // console.log('newTab', newTab);
        if (oldTab) {
          oldTab.selected = false;
          if (oldTab.dirty) {
            this.openCodes[oldTab.path] = this.currentCode;
          }
        }
        if (newTab) {
          newTab.selected = true;
        } else { // 否则新建标签
          this.tabOrder.push(this.currentFile);
          this.showClose(newPath);
        }
        this.getFile();
      }
    },
    currentCode: function (newCode) {
      // 标识脏状态，简单粗暴有待改善
      if (this.currentFile) {
        if (!this.currentFile.dirty && this.currentFile.type !== 'image') {
          this.currentFile.dirty = this.originalCodes[this.currentFilepath] !== newCode;
          this.tabOrder.find(el => el.path === this.currentFilepath).dirty = this.currentFile.dirty;
          this.showDirty(this.currentFilepath, this.currentFile.dirty);
        }
      }
    }
  },
  created: function () {
    eventBus.$on('renameTab', this.syncName);
    eventBus.$on('closeTab', this.closeTab);
    // eventBus.$on('showPicture', this.showPictureWindow);
    eventBus.$on('callSaveFromMenu', this.save);
  }
};

</script>

<style>
#innerEditor {
  position: absolute;
  height: 100%;
  width: calc(100% - 6px);
  border-bottom: 2px solid #21252B;
}
#innerEditorContainer {
  position: absolute;
  top: 35px;
  margin: 0px;
  height: calc(100% - 35px);
  width: 100%;
  overflow: hidden;
}
#editArea, #imgArea {
    position:absolute;
    margin:0;
    height: 100%;
    width: 100%;
    overflow: hidden;
}
#imgArea {
  text-align: center;
  display: table;
}
#imgBox {
  display: table-cell;
  vertical-align: middle;
  background-image: url('../assets/img/imgBackground.png');
}
#imgBox img {
  /* 临时性修补，不超过容器高度 */
  max-height: 604px;
  max-width: 100%;
}
#tabBar {
  position: relative;
  width: 100%;
  height: 35px;
  padding: 0px;
  background-color: #21252B;
  border-bottom: 1px solid #1E2127;
}
#tabs {
  position: absolute;
  height: 100%;
  padding: 0px;
  width: auto;
}
.editor {
  position: relative;
  height: 100%;
  width: 100%;
  background: #141414;
  box-sizing: border-box;
  display: inline-block;
  overflow: hidden;
}
.tab {
  display: inline-block;
  position: relative;
  height: 100%;
  min-width: 150px;
  padding: 0px;
  background-color: #21252B;
  border-right: 1px solid #181A1F;
}
.tab:hover {
  cursor: pointer;
  background-color: #323842;
}
.active {
  background-color: #282C34;
}
.tabName {
  display: inline-block;
  height: 100%;
  padding: 2px 10px;
  font-size: 16px;
}
.tabIcon {
  display: inline-block;
  position: absolute;
  top: 2px;
  right: 2px;
  color: #C5C5C5;
}
.touchArea {
  display: block;
  position: absolute;
  top: 9px;
  right: 5px;
  width: 17px;
  height:17px;
}
.dirtyIcon {
  position: absolute;
  top: 0px;
  right: 0px;
}
.dirtyIcon:hover {
  display: none;
}
</style>
