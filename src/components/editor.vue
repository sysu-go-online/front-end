<template>
  <div id="editor">
      <p class="func_button">保存</p>
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
      code: '12312',
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
      }
    }
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
      console.log('this is new code', newCode)
      this.code = newCode
    }
  }
}
// 代码内容 code
// 设置代码内容
// function setValue () {

// }
// 保存代码内容
// function save () {

// }
</script>

<style>
#editor{
    left: 10%;
    position: relative;
    height: 100%;
    width: 55%;
    background: #141414;
    box-sizing: border-box;
    display: inline-block;
    overflow: hidden;
}
#edit-area{
    position:absolute;
    margin-top: 5px;
    height: calc(100% - 37px);
    width: 100%;
    overflow: hidden;
}
.vue-codemirror,.CodeMirror{
    height: 100% !important;
    width: 100%;
}
</style>
