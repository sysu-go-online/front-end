<template>
  <div class="my_terminal" ref="xterm">
  </div>
</template>

<script>
/* eslint-disable */
import { Terminal } from 'xterm'
import 'xterm/dist/xterm.css'
import 'xterm/dist/xterm.js'
import Vue from 'vue'

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
      var term = new this.$terminal({
        cursorBlink: true,
        cols: 43,
        rows: 24
      })
      term.open(this.$refs.xterm)
      if (term._initialized) {
        return
      }
      term._initialized = true
      var shellprompt = '$ '

      term.prompt = function() {
        term.write('\r\n' + shellprompt)
      }

      term.writeln('Welcome to xterm.js')
      term.writeln('Type some keys and commands to play around.')
      term.writeln('')
      term.prompt()

      return term
    },
    terminalFlow: function(command,that) {
      if (that.ws != null) {
        return
      }
      that.ws = new WebSocket('ws://120.79.0.17/api/ws')
      that.ws.send(command)
      that.ws.onmessage = function (evt) {
        that.xterm.write(evt.data)
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
      var printable =
        !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey

      if (ev.keyCode == 13) {
        that.term.write('\r\n')  
        that.terminalFlow(that.command, that)
      } else if (ev.keyCode == 8) {
        // Do not delete the prompt
        if (that.ws === null && that.term.buffer.x > 2) {
          that.command = that.command.slice(0, that.command.length)
          that.term.write('\b \b')
        }
      } else if (printable) {
        that.command += key
        that.term.write(key)
      }
    })

    this.term.on('paste', function(data, ev) {
        that.command += data
      that.term.write(data)
    })
  }
}
</script>

<style>
.my_terminal {
  width: 100%;
  height: 190px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
