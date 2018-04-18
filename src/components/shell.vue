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
      ws: null
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
    Ws: function() {
      return new WebSocket('ws://localhost:8080/echo')
    }
  },
  mounted() {
    var str = ''
    var input_state = true

    var term = this.Xterm()
    var ws = this.Ws()
  　term.on('key', function(key, ev) {
      var printable =
        !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
      ws.onopen = function() {
        console.log('success')
      }
      ws.onerror = function() {
        console.log('error')
      }

      if (ev.keyCode == 13) {
        term.prompt()
        if (input_state) {
          ws.send(str)
        }

        input_state = false
        ws.onmessage = function(ev) {
          term.write(ev.data)
          term.prompt()
          str = ''
          input_state = true
        }
      } else if (ev.keyCode == 8) {
        // Do not delete the prompt
        if (term.buffer.x > 2) {
          str = str.slice(0, str.length)
          term.write('\b \b')
        }
      } else if (printable) {
        if (input_state) {
          str += key
        }
        term.write(key)
      }
    })
    term.on('paste', function(data, ev) {
      if (input_state) {
        str += data
      }
      term.write(data)
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
