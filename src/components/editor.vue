<template>
  <div id="editor">
    <div id="function-area">
      <!-- 标签栏 -->
      <!-- TODO:
      2. 标识脏状态
      3. 文件缩略图-->
      <span v-if="this.localOpenFileOrder.length">
        <span v-for="file in this.tabOrder" :key=file.path :class="['tab', {active: file.isSelected}]" @click="switchFile(file.path)">
          <span class="file-name">{{ file.name }}</span>
          <!-- TODO:
          1. 同名时显示路径-->
          <span class="span_icon">
            <svg class="icon icon-search-close" @click.stop="checkDirtyThenClose(file.path)"><use xlink:href="#icon-search-close"></use></svg>
          </span>
        </span>
      </span>
      <span id="save"><input type="button" value="保存" id="save-button" @click="Save"></span>
    </div>
    <div id="edit-area" v-show="!this.showPicture" @keyup.ctrl.83.stop="Save" @keydown.ctrl.83.prevent>
      <!-- 编辑区 -->
      <!-- TODO: 本地缓存 -->
      <MonacoEditor
        class="editor"
        v-model="currentCode"
        language="go"
        theme="vs-dark"
        ref="editor"
      />
    </div>
    <div v-show="this.showPicture" id="img-area">
      <img :src="this.imgUrl" />
    </div>
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco';
import {mapGetters, mapActions} from 'vuex';
import eventBus from '../util/eventBus.js';

export default {
  name: 'Editor',
  data () {
    return {
      // 已打开文件的信息
      localOpenFiles: {},
      // 已打开的所有代码
      openCodes: new Map(),
      // 按顺序存储打开文件的绝对路径
      localOpenFileOrder: [],
      // 标签的显示顺序
      tabOrder: {},
      currentFilePath: '',
      currentCode: '',
      imgUrl: '',
      showPicture: false
    };
  },
  computed: {
    ...mapGetters(['projectName', 'tree', 'currentFile', 'openFiles', 'openFileOrder'])
  },
  components: {
    MonacoEditor
  },
  methods: {
    ...mapActions(['setTree', 'setCurrentFile', 'setOpenFileOrder', 'setOpenFiles']),
    switchFile: function (filepath) {
      if (filepath === this.currentFilePath) return;
      eventBus.$emit('callSelNodeFromEditor', this.localOpenFiles[filepath]);
    },
    getFile: function (file) {
      // console.log(file);
      if (file.isPicture) {
        this.currentCode = '';
        var hostname = window.location.hostname;
        // 测试用
        // hostname = 'go-online.heartublade.com';
        this.$http.get('http://image.' + hostname + '/' + this.$cookie.get('username') + '/' + file.path, {
          headers: {
            'Authorization': this.$cookie.get('jwt')
          },
          // withCredentials:true,
          responseType: 'arraybuffer'
        }).then(Response => {
          // console.log(Response);
          var suffix = file.path.split('.').pop();
          // 待测试
          this.imgUrl = 'data:image/' + suffix + ';base64,' + btoa(new Uint8Array(Response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
          this.tabOrder[file.path] = file;
        }).catch(() => {
          this.$dialog.alert('太大啦！', {backdropClose: true});
        });
        return;
      } else if (this.openCodes.has(file.path)) {
        this.currentCode = this.openCodes.get(file.path);
        this.tabOrder[file.path].isSelected = true;
        return;
      }
      let relativePath = file.path.slice(this.projectName.length + 1);
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        this.currentCode = Response.data.toString();
        this.openCodes.set(file.path, this.currentCode);
        this.tabOrder[file.path] = file;
        this.$forceUpdate();
      });
    },
    Save (filePath) {
      if (typeof (filePath) !== 'string') {
        filePath = this.currentFilePath;
      }
      console.log(filePath);
      let file = this.localOpenFiles[filePath];
      if (file.isSelected) {
        this.openCodes.set(filePath, this.currentCode);
      }
      let relativePath = file.path.slice(this.projectName.length + 1);
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        'operation': 'update',
        'content': this.openCodes.get(filePath)
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // TODO：修改为气泡提示格式
        if (this.tabOrder[filePath]) {
          this.tabOrder[filePath].isDirty = false;
        }
        this.$dialog.alert('保存成功', {backdropClose: true});
      }).catch(() => {
        this.$dialog.alert('保存失败', {backdropClose: true});
      });
    },
    checkDirtyThenClose: function (filePath) {
      // let file = this.openFiles.get(filePath);
      // console.log(file);
      var file = this.tabOrder[filePath];
      if (file.isDirty) {
        // 提示是否保存
        this.$dialog.confirm('是否要保存对 ' + file.name + ' 的更改？', {
          okText: '是',
          cancelText: '否',
          backdropClose: true
        }).then(() => {
        // 是
          this.Save(filePath);
          this.closeFile(filePath);
        }).catch(() => {
          this.closeFile(filePath);
        });
      } else {
        this.closeFile(filePath);
      }
    },
    closeFile: function (filePath) {
      let file = this.localOpenFiles[filePath];
      if (file) {
        // console.log(this.localOpenFileOrder);
        let indexOfPath = this.localOpenFileOrder.indexOf(filePath);
        this.localOpenFileOrder.splice(indexOfPath, 1);
        // console.log(this.localOpenFileOrder);
        if (file.isSelected) {
          if (indexOfPath >= 1) {
            var nextPath = this.localOpenFileOrder[indexOfPath - 1];
            this.localOpenFileOrder.splice(indexOfPath - 1, 1);
            this.localOpenFileOrder.push(nextPath);
            this.switchFile(this.localOpenFileOrder[indexOfPath - 1]);
            // console.log(this.localOpenFileOrder[indexOfPath - 1]);
            // console.log(this.localOpenFileOrder);
          } else { // 若不存在，则文件队列为空，清除当前文件信息
            this.currentCode = '';
            this.currentFilePath = '';
            this.switchFile(null);
          }
        }
        // 删除文件记录及代码记录
        this.setOpenFileOrder({'openFileOrder': this.localOpenFileOrder});
        delete this.localOpenFiles[filePath];
        this.setOpenFiles({'openFiles': this.localOpenFiles});
        this.openCodes.delete(filePath);
        delete this.tabOrder[filePath];
      }
    },
    renameTab: function (newFile, oldPath) {
      delete this.tabOrder[oldPath];
      this.tabOrder[newFile.path] = newFile;
    },
    closeTab: function (tabPath) {
      delete this.tabOrder[tabPath];
      this.openCodes.delete(tabPath);
      this.$forceUpdate();
    },
    showPictureWindow: function (state) {
      this.showPicture = state;
    }
  },
  watch: {
    currentFile: {
      handler: function (file, oldFile) {
        if (!file) return;
        // 失活上一标签
        if (JSON.stringify(oldFile) !== '{}' && oldFile) {
          // 切换文件，更新上一文件代码缓存
          if (this.localOpenFiles[oldFile.path] && this.tabOrder[oldFile.path]) {
            this.openCodes.set(oldFile.path, this.currentCode);
            this.tabOrder[oldFile.path].isSelected = false;
          }
        }
        this.currentFilePath = file.path;
        this.localOpenFiles[this.currentFilePath] = file;
        this.getFile(file);
      },
      deep: true
    },
    openFiles: {
      handler: function (files, oldFiles) {
        // 深度复制
        this.localOpenFiles = JSON.parse(JSON.stringify(files));
      },
      deep: true
    },
    openFileOrder: function (order, oldOrder) {
      // 深度复制
      this.localOpenFileOrder = order.concat();
    },
    currentCode: function (cCode) {
      var file = this.tabOrder[this.currentFilePath];
      if (!file) return;
      if (!file.isDirty) {
        let relativePath = file.path.slice(this.projectName.length + 1);
        this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          // console.log(Response);
          if (Response.data.toString() !== cCode) {
            this.tabOrder[this.currentFilePath].isDirty = true;
            // console.log('dirty!!!!');
          }
        });
      }
    }
  },
  created: function () {
    eventBus.$on('renameTab', this.renameTab);
    eventBus.$on('closeTab', this.closeTab);
    eventBus.$on('showPicture', this.showPictureWindow);
    eventBus.$on('callSaveFromMenu', this.Save);
  }
};

</script>

<style>
.editor {
    position: relative;
    height: 100%;
    width: 100%;
    background: #141414;
    box-sizing: border-box;
    display: inline-block;
    overflow: hidden;
}
#edit-area, #img-area {
    position:absolute;
    margin:0;
    height: calc(100% - 32px);
    width: 100%;
    overflow: hidden;
}
#img-area {
  display: flex;
  justify-content: center;
  align-items: center;
}
#function-area {
  height: 32px;
  width: 100%;
  background: rgba(17, 17, 17, 0.4);
}
#save-button {
  color: white;
  padding: 2px 5px;
  background-color: #009A61;
  border: none;
  border-radius: 5px;
  outline: none;
}
.icon-search-close {
  width: 9px;
  height: 9px;
  color: rgba(219, 218, 218, 0.4)
}
.func_button {
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
/* TODO：修改标签栏样式 */
.active {
   background-color: #282C34 !important;
}

.tab {
  font-size: 16px;
  color: #009A61;
  display: inline-block;
  height: 100%;
  min-width: 200px;
  padding: 3px 10px;
  border: 1px solid #4e5653;
  border-left: 0px;
  background:  rgba(17, 17, 17, 0.4);
  /* border-color: #2b2b2b  #bebebe #009A61  #bebebe; */
}
.tab .span_icon {
  float: right;
  visibility: hidden;
  display: block;
}
.tab:hover {
  background-color: #323842 !important;
  cursor: pointer;
}
.tab:hover .span_icon {
  visibility: visible;
  /* display: inline-block; */
}
#save {
  display: inline-block;
  position: absolute;
  top: 5px;
  right: 10px;
}
.vue-codemirror,.CodeMirror{
    height: 100% !important;
    width: 100%;
}
</style>
