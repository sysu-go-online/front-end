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
      key: null // 获取换行字符对应的字符串; 验证，xterm.js先触发'key'事件，再触发'data'事件
    }
  },
  props:['height', 'width'],
  methods: {
    Xterm: function() {
      this.$terminal.applyAddon(fit);
      var term = new this.$terminal({
        cursorBlink: true
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
      that.ws = new WebSocket('ws://120.79.0.17/api/ws')
      that.ws.onopen = function(evt) {
        that.ws.send(command)
      }
      that.ws.onmessage = function (evt) {
        that.term.writeln(evt.data.replace(/\n/g, '\r\n'))
        // that.term.write(evt.data.split('\n').join('\r\n'))
      }
      that.ws.onclose = function(evt) {
        // \r 回车符，回到一行开头
        // \n 换行符，另起一行
        that.term.write('$ ')
        that.ws = null
      }
    }
  },
  mounted() {
    var that = this
    this.term = this.Xterm()
    this.term.on('key', function(key, ev) {
      // TODO: Add event when different key was hit
      // Store command if the connection has not be established
      if (!that.ws) {
        // When meet Ctrl+C clear all the command
        if (ev.keyCode == 67) {
          that.term.prompt()
          that.command.length = 0
          return
        }

        // Send command when meet return
        if (ev.keyCode == 13) {
          console.log(that.command)
          if (that.command.length == 0) {
            that.term.prompt()
          } else {
            that.term.write('\r\n')
            that.terminalFlow(that.command, that)
            that.command = ''
          }
          return
        }
        
        // Delete
        if (ev.keyCode == 8) {
          // Do not delete the prompt
          if (that.term.buffer.x > 2) {
            var len = that.command.length
            if(that.command.charCodeAt(len - 1) > 255) {
              that.term.write('\b \b')
              that.term.write('\b \b')
            } else {
              that.term.write('\b \b')
            }
            that.command = that.command.slice(0, len - 1)
          }
          return
        }
      } else {
        // TODO: Send content according to the key code
      }
      // if (ev.keyCode == 67) {
      //   if(that.ws != null) {
      //     that.ws.close()
      //   }
      // }
      // if (ev.keyCode == 13) {
      //   // 先触发'key'事件，再触发'data'事件，所以换行符必然会被写入command,采用该种方式避免
      //   that.key = key
      //   if (that.command.length == 0) {
      //     that.term.prompt()
      //   } else {
      //     that.term.write('\r\n')
      //     that.terminalFlow(that.command, that)
      //     that.command = ''
      //   }
      // } else if (ev.keyCode == 8) {
      //   // Do not delete the prompt
      //   if (that.ws === null && that.term.buffer.x > 2) {
      //     var len = that.command.length
      //     if(that.command.charCodeAt(len - 1) > 255) {
      //       that.term.write('\b \b')
      //       that.term.write('\b \b')
      //     } else {
      //       that.term.write('\b \b')
      //     }
      //     that.command = that.command.slice(0, len - 1)
      //   }
      // }
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
        return
      } else {
        that.terminalFlow(key, that)
      }
      // var pat = /.*/
      // //禁止添加上下左右移动字符
      // if(str == '[A' || str == '[B' || str == '[C' || str == '[D') {
      //   that.term.write(str)
      //   return
      // }
      // //禁止输入其他非法字符
      // if(pat.test(str) || str == '\n' || str == '\r' || str == that.key) {
      //   return
      // }
      // console.log(str)
      // that.term.write(str)
      // that.command += str
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
