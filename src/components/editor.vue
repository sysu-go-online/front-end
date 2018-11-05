<template>
  <div id="editor">
    <div id="function-area">
      <!-- 标签栏 -->
      <!-- TODO:
      1. 改成多标签
      2. 识别脏状态
      3. 文件缩略图-->
      <span v-if="this.currentFileID != ''">
        <span v-for="fileid in this.fileIDs" :key=fileid :class="['tab', {active: files[fileid].isSelected}]" @click="switchFile(fileid)">
          <span class="file-name">{{ files[fileid].name }}</span>
          <!-- TODO:
          1. 同名时显示路径
          2. 显示脏状态-->
          <span class="span_icon">
            <svg class="icon icon-search-close" @click.stop="checkDirtyThenClose(fileid)"><use xlink:href="#icon-search-close"></use></svg>
          </span>
        </span>
      </span>
      <span id="save"><input type="button" value="保存" id="save-button" @click="Save"></span>
    </div>
    <div id="edit-area" @keyup.ctrl.83.stop="Save(currentFileID)" @keydown.ctrl.83.prevent>
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

export default {
  name: 'Editor',
  data () {
    return {
      currentCode: '',
      // id作为key
      openedCodes: new Map(),
      // 同fileID，用来存储打开代码的顺序
      fileIDs: [],
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
      currentFileID: ''
    };
  },
  props: {
    currentFile: {
      default: function () {
        return {};
      }
    },
    toDeleteFileId: {
      default: function () {
        return {};
      }
    },
    toRenameFile: {
      default: function () {
        return {};
      }
    },
    projectName: ''
  },
  components: {
    MonacoEditor
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
    Save (fileid) {
      let file = this.files[fileid];
      if (file.isSelected) {
        this.openedCodes.set(fileid, this.currentCode);
      }
      // console.log("current code ", this.currentCode);
      // console.log("save code", this.openedCodes.get(fileid));
      this.$http.patch('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + file.path, {
        'operation': 'update',
        'content': this.openedCodes.get(fileid)
      }, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // TODO：修改为气泡提示格式
        if (this.files[fileid]) {
          this.files[fileid].isDirty = false;
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
        // console.log('invalid name');
        return;
      } else if (this.openedCodes.has(file.id)) {
        this.currentCode = this.openedCodes.get(file.id);
        // console.log('got from log ', this.currentCode);
        return;
      }
      this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + file.path, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      }).then(Response => {
        // console.log(Response);
        this.currentCode = Response.data.toString();
        this.openedCodes.set(file.id, this.currentCode);
        this.fileIDs.push(file.id);
      });
    },
    switchFile: function (fileid) {
      if (fileid === this.currentFileID) return;
      // 本地保存当前代码
      // TODO-BUG: 输入完代码后立即单击切换文件，有时会无法保存当前文件代码
      if (this.currentFileID) {
        this.openedCodes.set(this.currentFileID, this.currentCode);
      }
      // 切换当前文件
      this.files[fileid].isSelected = true;
      this.$emit('openfile', this.files[fileid], this.projectName);
      // console.log("changed");
    },
    checkDirtyThenClose: function (fileid) {
      let file = this.files[fileid];
      // console.log(file);
      if (file.isDirty) {
        // 提示是否保存
        this.$dialog.confirm('是否要保存对 ' + this.files[fileid].name + ' 的更改？', {
          okText: '是',
          cancelText: '否',
          backdropClose: true
        }).then(() => {
        // 是
          this.Save(fileid);
          this.closeFile(fileid);
        }).catch(() => {
          this.closeFile(fileid);
        });
      } else {
        this.closeFile(fileid);
      }
    },
    closeFile: function (fileid) {
      let file = this.files[fileid];
      let indexOfID = this.fileIDs.indexOf(fileid);
      this.fileIDs.splice(indexOfID, 1);
      // console.log(file);
      if (file.isSelected) {
        // 顺延打开下一文件
        if (this.fileIDs[indexOfID]) {
          this.switchFile(this.fileIDs[indexOfID]);
        } else if (this.fileIDs[--indexOfID]) { // 若不存在，则顺延打开上一文件
          this.switchFile(this.fileIDs[indexOfID]);
        } else { // 若不存在，则文件队列为空，清楚当前文件信息
          this.currentCode = '';
          this.currentFileID = '';
          this.$emit('nofileopen');
        }
      }
      // 删除文件记录及代码记录
      // FIXED-BUG:已删除，但不更新页面
      delete this.files[fileid];
      // console.log("deleted");
      this.openedCodes.delete(fileid);
      // TODO: 待改良
      this.$emit('closeFile', fileid);
      this.$forceUpdate();
    }
  },
  watch: {
    currentFile: {
      handler: function (file, oldFile) {
        if (file === undefined) return;
        // 失活上一标签
        if (JSON.stringify(oldFile) !== '{}' && oldFile !== undefined) {
          if (oldFile.id === file.id) {
            // 待测试：同步重命名
            if (oldFile.name !== file.name) {
              this.files[file.id].name = file.name;
            }
            return;
          }
          // 切换文件，更新上一文件代码缓存
          if (this.files[oldFile.id]) {
            this.files[oldFile.id].isSelected = false;
            this.openedCodes.set(oldFile.id, this.currentCode);
          }
        }
        this.currentFileID = file.id;
        this.files[this.currentFileID] = file;
        this.getFile(file);
      },
      deep: true
    },
    currentCode: function (cCode) {
      var file = this.files[this.currentFileID];
      if (!file.isDirty) {
        this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects/' + this.projectName + '/files/' + file.path, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(Response => {
          // console.log(Response);
          file.isDirty = Response.data.toString() !== cCode;
        });
      }
    },
    toDeleteFileId: function (id, oldId) {
      // this.currentFileID = null;
      this.closeFile(id);
    },
    toRenameFile: {
      handler: function (file, oldFile) {
        this.files[file.id].name = file.name;
        this.files[file.id].path = file.path;
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
