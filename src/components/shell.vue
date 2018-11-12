<template>
  <div id="shell" class="my_terminal" ref="xterm">
  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import { Terminal } from 'xterm'
import 'xterm/dist/xterm.css'
import 'xterm/dist/xterm.js'
import * as fit from 'xterm/lib/addons/fit/fit.js'

Object.defineProperty(Vue.prototype, '$terminal', { value: Terminal })
export default {
  name: 'Shell',
  data() {
    return {
      term: null,
      ws: null,
      command: '',// 用户输入内容
      key: null, // 获取换行字符对应的字符串; 验证，xterm.js先触发'key'事件，再触发'data'事件
      projectName: '',
      cols: this.term.cols,
      row: this.term.rows
    }
  },
  methods: {
    Xterm: function() {
      this.$terminal.applyAddon(fit);
      //注册终端
      var term = new this.$terminal({
        cursorBlink: true,
        rows: 10
      })
      term.open(this.$refs.xterm)
      if (term._initialized) {
        return
      }
      term.fit()
      term._initialized = true
      var shellprompt = '$ '

      term.prompt = function() {
        term.write('\r\n' + shellprompt) //换行+'$'
      }

      term.writeln('欢迎来到 go-online!')
      term.writeln('Type some keys and commands to play around.')
      term.writeln('输入命令以建立链接')
      term.writeln('')
      this.terminalFlow(this)
      // term.prompt()

      return term
    },
    terminalFlow: function(that) {
      //let hostname = window.location.hostname;
      let hostname = "go-online.heartublade.com"
      that.ws = new WebSocket('ws://' + hostname + '/api/ws/tty');
      that.ws.onopen = function(evt) {
        console.log(that.projectName);
        that.ws.send(JSON.stringify({
          'jwt': that.$cookie.get('jwt'),
          'project': that.projectName,
          'msg': '\n',
          'language': 0,
          'type': 0,
          'length': that.term.cols,
          'width': that.term.rows
        }));
        // that.term.writeln('链接建立成功');
        // console.log(that.term.cols);
      }
      that.ws.onmessage = function (evt) {
        console.log(evt.data);
        let res = JSON.parse(evt.data);
        // 判断是否连接成功
        if (!res.ok) {
          // if (res.err == "websocket: close 1006 (abnoormal closure): unexpected EOF") return;
          that.term.write('error occured: ')
          that.term.writeln(res.msg);
          return;
        }
        if (res.ok) {
          // 输入exit后接收到服务端返回值断开连接并重连
          if (res.msg == "\r\nexit"){
            that.ws.close();
            
            // console.log("exit");
          }
          that.term.write(res.msg);
          return;
        }
        // if (res.Type == 'dname') {
        //   console.log(res.msg);
        //   that.$emit('dbname', res.msg);
        //   return;
        // }
      }
      that.ws.onclose = function(evt) {
        // that.term.writeln('链接已关闭，输入命令重新建立链接');
        that.term.writeln('链接已断开');
        that.term.writeln('正在重连');
        that.ws = null;
        that.terminalFlow(that);
      }
      that.ws.onerror = function(evt) {
        that.term.writeln('报错');
      }
    },
    terminalSend: function (command) {
      this.ws.send(JSON.stringify({
        // 'jwt': that.$cookie.get('jwt'),
        // 'project': that.projectName,
        'msg': command,
        // 'language': 0,
        'type': 0
      }));
      // console.log(this.term.cols);
    },
    //发送终端宽高
    terminalSizeSend: function(cols, rows){
      this.ws.send(JSON.stringify({
        'length': rows,
        'width': cols
      }));
    }
  },
  created() {
    this.projectName = this.$route.params.projectname;
  },
  mounted() {
    var that = this;
    this.term = this.Xterm();
    console.log(this.term);
    this.term.on('data', function(key) {
      // TODO: Add event when different key was hit
      // Store command if the connection has not be established
      // if (!that.ws) {
      //   // When meet Ctrl+C clear all the command
      //   if (ev.keyCode == 67) {
      //     that.term.prompt();
      //     that.command = '';
      //     return; 
      //   }

      //   // Send command when meet return
      //   if (ev.keyCode == 13) {
      //     if (that.command.length == 0) {
      //       that.term.prompt();
      //     } else {
      //       that.term.write('\r\n');
            // that.terminalFlow(that.command, that);
      //       that.command = '';
      //     }
      //     return;
      //   }

      //   // Delete
      //   if (ev.keyCode == 8) {
      //     // Do not delete the prompt
      //     if (that.command != 0) {
      //       that.term.write('\b \b');
      //       let len = that.command.length;
      //       that.command = that.command.slice(0, len - 1);
      //     }
      //     return;
      //   }
      // } else {
        // if (that.ws.readyState == 1) {
          // TODO: Send content according to the key code
          that.terminalSend(key);
          // console.log(this.term.cols);
          // console.log(key);
      //   } else if (that.ws.readyState == 0) {
      //     // TODO: Store message when the ws is connecting and send message when the connection has been send
      //   }
      // }
    })
    console.log(this.term.cols);
    console.log(this.term.rows);
    this.term.on('paste', function(data, ev) {
      // that.command += data
      that.terminalSend(data)
    })
    // this.term.on('data', function(str) {
    //   if (!that.ws) {
    //     var pat = /.*/
    //     //禁止添加上下左右移动字符
    //     if(str == '[A' || str == '[B' || str == '[C' || str == '[D') {
    //       that.term.write(str)
    //       return
    //     }
    //     //禁止输入其他非法字符
    //     if(pat.test(str) || str == '\n' || str == '\r' || str == that.key) {
    //       return
    //     }
    //     // Add valid str
    //     that.command += str
    //     that.term.write(str)
    //   } else {
    //     if (that.ws.readyState == 1) {
    //       // that.terminalFlow(str, that)
    //     } else if (that.ws.readyState == 0) {
    //       // TODO: Store message when the ws is connecting and send message when the connection has been send
    //     }
    //   }
    // })
  },
  //关闭websocket
  destroyed: function () {
    this.ws.close();
  },
  watch: {
    height: {
      handler: function (val, oldval) {
        this.term.fit()
      },
      deep: true
    },
    width: {
      handler: function (val, oldval) {
        this.term.fit()
      },
      deep: true
    }
  }
}
</script>

<style>
#shell {
  width: 100%;
}
.my_terminal {
  /* width: 100%; */
  box-sizing: border-box;
  overflow: hidden;
}
</style>
