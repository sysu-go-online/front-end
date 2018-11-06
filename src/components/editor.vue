<template>
  <div id="editor">
    <div id="function-area">
      <!-- 标签栏 -->
      <!-- TODO:
      1. 改成多标签
      2. 识别脏状态
      3. 文件缩略图-->
      <span v-if="this.currentFilePath != ''">
        <span v-for="filePath in this.filePaths" :key=filePath :class="['tab', {active: files[filePath].isSelected}]" @click="switchFile(filePath)">
          <span class="file-name">{{ files[filePath].name }}</span>
          <!-- TODO:
          1. 同名时显示路径
          2. 显示脏状态-->
          <span class="span_icon">
            <svg class="icon icon-search-close" @click.stop="checkDirtyThenClose(filePath)"><use xlink:href="#icon-search-close"></use></svg>
          </span>
        </span>
      </span>
      <span id="save"><input type="button" value="保存" id="save-button" @click="Save"></span>
    </div>
    <div id="edit-area" @keyup.ctrl.83.stop="Save(currentFilePath)" @keydown.ctrl.83.prevent>
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
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco';
import eventBus from '../util/eventBus.js';

export default {
  name: 'Editor',
  data () {
    return {
      currentCode: '',
      // id作为key
      openedCodes: new Map(),
      // 同fileID，用来存储打开代码的顺序
      filePaths: [],
      cmOptions: {
        // codemirror options
        indentUnit: 2,
        tabSize: 2,
        styleActiveLine: true,
        mode: 'text/x-go',
        theme: 'mbo',
        lineWrapping: false,
        lineNumbers: true,
        line: true,
        language: 'go'
      },
      // 已打开文件的信息
      files: {},
      currentFilePath: ''
    };
  },
  props: {
    currentFile: {
      default: function () {
        return {};
      }
    },
    fileToRename: {
      default: function () {
        return {};
      }
    },
    projectName: ''
  },
  components: {
    MonacoEditor
  },
  created: function () {
    eventBus.$on('closeTab', this.closeFile);
    eventBus.$on('changeTabName', this.checkToRename);
    eventBus.$on('callSaveFromMenu', this.Save(this.currentFilePath));
  },
  methods: {
    updateFunc (newCode, evt) {
      this.currentCode = newCode;
    },
    onCmReady (cm) {

    },
    onCmFocus (cm) {

    },
    onCmCodeChange (newCode) {
      this.currentCode = newCode;
    },
    // OK:
    Save (filePath) {
      let file = this.files[filePath];
      if (file.isSelected) {
        this.openedCodes.set(filePath, this.currentCode);
      }
      // console.log("current code ", this.currentCode);
      // console.log("save code", this.openedCodes.get(filePath));
      let relativePath = file.path.slice(this.projectName.length + 1);
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        'operation': 'update',
        'content': this.openedCodes.get(filePath)
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // TODO：修改为气泡提示格式
        if (this.files[filePath]) {
          this.files[filePath].isDirty = false;
        }
        this.$dialog.alert('保存成功', {backdropClose: true});
      }).catch(() => {
        this.$dialog.alert('保存失败', {backdropClose: true});
      });
    },
    getFile: function (file) {
      // console.log(file);
      if (file.name === '') {
        // 貌似不可能存在？
        this.currentCode = '';
        return;
      } else if (this.openedCodes.has(file.path)) {
        this.currentCode = this.openedCodes.get(file.path);
        return;
      }
      let relativePath = file.path.slice(this.projectName.length + 1);
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log(Response);
        this.currentCode = Response.data.toString();
        this.openedCodes.set(file.path, this.currentCode);
        this.filePaths.push(file.path);
      });
    },
    switchFile: function (filePath) {
      if (filePath === this.currentFilePath) return;
      // 本地保存当前代码
      // TODO-BUG: 输入完代码后立即单击切换文件，有时会无法保存当前文件代码
      if (this.currentFilePath) {
        this.openedCodes.set(this.currentFilePath, this.currentCode);
      }
      // 切换当前文件
      this.files[filePath].isSelected = true;
      this.$emit('openfile', this.files[filePath], this.projectName);
      // console.log("changed");
    },
    checkDirtyThenClose: function (filePath) {
      let file = this.files[filePath];
      // console.log(file);
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
      let file = this.files[filePath];
      if (file) {
        let indexOfPath = this.filePaths.indexOf(filePath);
        this.filePaths.splice(indexOfPath, 1);
        // console.log(file);
        if (file.isSelected) {
          // 顺延打开下一文件
          if (this.filePaths[indexOfPath]) {
            this.switchFile(this.filePaths[indexOfPath]);
          } else if (this.filePaths[--indexOfPath]) { // 若不存在，则顺延打开上一文件
            this.switchFile(this.filePaths[indexOfPath]);
          } else { // 若不存在，则文件队列为空，清楚当前文件信息
            this.currentCode = '';
            this.currentFilePath = '';
            this.$emit('nofileopen');
          }
        }
        // 删除文件记录及代码记录
        // FIXED-BUG:已删除，但不更新页面
        delete this.files[filePath];
        // console.log("deleted");
        this.openedCodes.delete(filePath);
        // TODO: 待改良
        this.$emit('closeFile', filePath);
        this.$forceUpdate();
      }
    },
    closeTab: function (path) {
      this.closeFile(path);
    },
    checkToRename: function (isCurrent, data, oldPath) {
      var index = this.filePaths.indexOf(oldPath);
      if (index !== -1) {
        this.filePaths[index] = data.path;
        delete this.files[oldPath];
        this.files[data.path] = data;
      }
    }
  },
  watch: {
    currentFile: {
      handler: function (file, oldFile) {
        if (file === undefined) return;
        // 失活上一标签
        if (JSON.stringify(oldFile) !== '{}' && oldFile !== undefined) {
          // if (oldFile.path === file.path) {
          //   if (oldFile.name !== file.name) {
          //     this.files[file.path].name = file.name;
          //   }
          //   return;
          // }
          // 切换文件，更新上一文件代码缓存
          if (this.files[oldFile.path]) {
            this.files[oldFile.path].isSelected = false;
            this.openedCodes.set(oldFile.path, this.currentCode);
          }
        }
        this.currentFilePath = file.path;
        this.files[this.currentFilePath] = file;
        this.getFile(file);
      },
      deep: true
    },
    currentCode: function (cCode) {
      var file = this.files[this.currentFilePath];
      if (!file.isDirty) {
        let relativePath = file.path.slice(this.projectName.length + 1);
        this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + relativePath, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          // console.log(Response);
          file.isDirty = Response.data.toString() !== cCode;
        });
      }
    },
    // toDeleteFilePath: function (path, oldPath) {
    //   // this.currentFilePath = null;
    //   console.log('sync');
    //   this.closeFile(path);
    // },
    fileToRename: {
      handler: function (newData, oldData) {
        if (this.currentFilePath === newData.oldPath) {
          this.currentFilePath = newData.path;
        }
        var index = this.filePaths.indexOf(newData.oldPath);
        if (index !== -1) {
          this.filePaths[index] = newData.path;
        }
        var code = this.openedCodes.get(newData.oldPath);
        this.openedCodes.set(newData.path, code);
        this.openedCodes.delete(newData.oldPath);
        var oldFile = this.files[newData.oldPath];
        oldFile.name = newData.name;
        oldFile.path = newData.path;
        this.files[newData.path] = oldFile;
        delete this.files[newData.oldPath];
      },
      deep: true
    }
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
#edit-area {
    position:absolute;
    margin:0;
    height: calc(100% - 32px);
    width: 100%;
    overflow: hidden;
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
