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
      if (that.ws == null) {
        return
      }
      that.ws = new WebSocket('ws:/ws')
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
    this.term = this.Xterm()

  　this.term.on('key', function(key, ev) {
      var printable =
        !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey

      if (ev.keyCode == 13) {
          this.terminalFlow(this.command, this)
      } else if (ev.keyCode == 8) {
        // Do not delete the prompt
        if (this.ws === null && this.term.buffer.x > 2) {
          this.command = this.command.slice(0, this.command.length)
          this.term.write('\b \b')
        }
      } else if (printable) {
        this.command += key
        this.term.write(key)
      }
    })

    this.term.on('paste', function(data, ev) {
        this.command += data
      this.term.write(data)
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
