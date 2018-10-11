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
      command: '',
      key: null, // 获取换行字符对应的字符串; 验证，xterm.js先触发'key'事件，再触发'data'事件
      projectName: ''
    }
  },
  methods: {
    Xterm: function() {
      this.$terminal.applyAddon(fit);
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
        term.write('\r\n' + shellprompt)
      }

      term.writeln('欢迎来到 go-online!')
      term.writeln('Type some keys and commands to play around.')
      term.writeln('输入命令以建立链接')
      term.writeln('')
      term.prompt()

      return term
    },
    terminalFlow: function(command, that) {
      if (that.ws != null) {
        // 如果已经存在ws连接，则直接往已有的ws中写入内容
        that.ws.send(command)
        return
      }
      let hostname = window.location.hostname;
      that.ws = new WebSocket('ws://' + hostname + '/api/ws/tty');
      that.ws.onopen = function(evt) {
        // console.log(that.projectName);
        that.ws.send(JSON.stringify({
          'JWT': that.$cookie.get('jwt'),
          'Project': that.projectName,
          'Command': command
        }));
        // that.term.writeln('链接建立成功');
      }
      that.ws.onmessage = function (evt) {
        console.log(evt.data);
        let res = JSON.parse(evt.data);
        if (res.Type == 'error') {
          // if (res.err == "websocket: close 1006 (abnormal closure): unexpected EOF") return;
          that.term.writeln(res.msg);
          return;
        }
        if (res.Type == 'tty') {
          that.term.write(res.msg);
          return;
        }
        if (res.Type == 'dname') {
          console.log(res.msg);
          that.$emit('dbname', res.msg);
          return;
        }
      }
      that.ws.onclose = function(evt) {
        // that.term.writeln('链接已关闭，输入命令重新建立链接');
        that.term.write('$ ');
        that.ws = null;
      }
      that.ws.onerror = function(evt) {
        that.term.writeln('报错');
      }
    },
    terminalSend: function (command) {
      this.ws.send(JSON.stringify({
        'Command': command
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
    this.term.on('key', function(key, ev) {
      // TODO: Add event when different key was hit
      // Store command if the connection has not be established
      if (!that.ws) {
        // When meet Ctrl+C clear all the command
        if (ev.keyCode == 67) {
          that.term.prompt();
          that.command = '';
          return; 
        }

        // Send command when meet return
        if (ev.keyCode == 13) {
          if (that.command.length == 0) {
            that.term.prompt();
          } else {
            that.term.write('\r\n');
            that.terminalFlow(that.command, that);
            that.command = '';
          }
          return;
        }

        // Delete
        if (ev.keyCode == 8) {
          // Do not delete the prompt
          if (that.command != 0) {
            that.term.write('\b \b');
            let len = that.command.length;
            that.command = that.command.slice(0, len - 1);
          }
          return;
        }
      } else {
        if (that.ws.readyState == 1) {
          // TODO: Send content according to the key code
          that.terminalSend(key);
          
        } else if (that.ws.readyState == 0) {
          // TODO: Store message when the ws is connecting and send message when the connection has been send
        }
      }
    })

    this.term.on('paste', function(data, ev) {
      that.command += data
      that.term.write(data)
    })
    this.term.on('data', function(str) {
      if (!that.ws) {
        var pat = /.*/
        //禁止添加上下左右移动字符
        if(str == '[A' || str == '[B' || str == '[C' || str == '[D') {
          that.term.write(str)
          return
        }
        //禁止输入其他非法字符
        if(pat.test(str) || str == '\n' || str == '\r' || str == that.key) {
          return
        }
        // Add valid str
        that.command += str
        that.term.write(str)
      } else {
        if (that.ws.readyState == 1) {
          // that.terminalFlow(str, that)
        } else if (that.ws.readyState == 0) {
          // TODO: Store message when the ws is connecting and send message when the connection has been send
        }
      }
    })
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
