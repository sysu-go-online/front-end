<template>
  <div class="my_terminal" ref="xterm">
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
      command: ''
    }
  },
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
        return
      }
      that.ws = new WebSocket('ws://120.79.0.17/api/ws')
      that.ws.onopen = function(evt) {
        that.ws.send(command)
      }
      that.ws.onmessage = function (evt) {
        that.term.writeln(evt.data)
      }
      that.ws.onclose = function(evt) {
        that.command = ''
        that.term.prompt()
        that.ws = null
      }
    }
  },
  mounted() {
    var that = this
    this.term = this.Xterm()
  　this.term.on('key', function(key, ev) {
      if (ev.keyCode == 67) {
        if(that.ws != null) {
          that.ws.close()
        }
      }
      if (ev.keyCode == 13) {
        if (that.command.length == 0) {
          that.term.prompt()
        } else {
          that.term.write('\r\n')
          that.terminalFlow(that.command, that)
        }
      } else if (ev.keyCode == 8) {
        // Do not delete the prompt
        if (that.ws === null && that.term.buffer.x > 2) {
          var len = that.command.length
          if(that.command.charCodeAt(len - 1) > 255) {
            that.term.write('\b \b')
            that.term.write('\b \b')
          } else {
            that.term.write('\b \b')
          }
          that.command = that.command.slice(0, len - 1)
        }
      }
    })

    this.term.on('paste', function(data, ev) {
      that.command += data
      that.term.write(data)
    })
    this.term.on('data', function(str) {
      var pat = /.*/
      //禁止添加上下左右移动字符
      if(str == '[A' || str == '[B' || str == '[C' || str == '[D') {
        that.term.write(str)
        return
      }
      //禁止输入其他非法字符
      if(pat.test(str) || str == '\n') {
        return
      }
      that.term.write(str)
      that.command += str
    })
  }
}
</script>

<style>
.my_terminal {
  /* width: 100%; */
  box-sizing: border-box;
  overflow: hidden;
}
</style>
