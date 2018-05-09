<template>
  <div id="editor">
    <div id="function-area">
      <span v-if="file != ''" class="file">
        <span class="file-name">{{file}}</span>
        <span class="span_icon">
          <svg class="icon icon-search-close" @click="closeFile"><use xlink:href="#icon-search-close"></use></svg>
       </span>
      </span>
      <span id="save"><input type="button" value="保存" id="save-button" @click="Save"></span>
    </div>
    <div id="edit-area">
        <codemirror v-model="code"
              :options="cmOptions"
              @ready="onCmReady"
              @focus="onCmFocus"
              @input="onCmCodeChange">
        </codemirror>
    </div>
  </div>
</template>

<script>
// require component
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/go/go.js'
import 'codemirror/theme/mbo.css'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

export default {
  name: 'Editor',
  data () {
    return {
      code: '',
      cmOptions: {
        // codemirror options
        indentUnit: 2,
        tabSize: 4,
        styleActiveLine: true,
        mode: 'text/x-go',
        theme: 'mbo',
        lineWrapping: false,
        lineNumbers: true,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      },
      file: '',
      filedata: this.fileData
    }
  },
  props: {
    fileData: {
      default: function () {
        return {}
      }
    },
  },
  components: {
    codemirror
  },
  methods: {
    onCmReady (cm) {
      console.log('the editor is readied!', cm.getTextArea())
    },
    onCmFocus (cm) {
      console.log('the editor is focus!', cm)
    },
    onCmCodeChange (newCode) {
      this.code = newCode
    },
    Save(){
      this.$http.post('/api/'+this.filedata.projectid+'/tree/'+this.filedata.filepath, this.code)
        .then(Response => {
          console.log(Response.status)
        })
    },
    getFile: function(val, that) {
      if (val.name == '') {
        that.code = ''
        return
      }
      that.$http.get('/api/'+val.projectid+'/tree/'+val.filepath)
        .then( Response => {
          that.code = Response.data
        })
    }
  },
  watch: {
    fileData:{
      handler:function(val,oldVal){
        this.filedata = val
        this.getFile(val, this)
        this.file = val.name
      },
        deep:true
    },
  }
}

</script>

<style>
#editor{
    position: relative;
    height: calc(100% - 200px);
    width: 100%;
    background: #141414;
    box-sizing: border-box;
    display: inline-block;
    overflow: hidden;
}
#edit-area{
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
.file {
  font-size: 16px;
  color: #009A61;
  display: inline-block;
  height: 100%;
  padding: 3px 10px;
  border: solid 1px;
  background: #2b2b2b;
  border-color: #2b2b2b  #bebebe #009A61  #bebebe;
}
.file .span_icon {
  visibility: hidden;
  display: inline-block;
}
.file:hover .span_icon {
  visibility: visible;
  display: inline-block;
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
