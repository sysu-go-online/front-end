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
import eventBus from '../util/eventBus.js'

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
      times: 0 // 重连计数
      // cols: this.term.cols,
      // row: this.term.rows,
      // terminalHeight: this.$refs.xterm.clientHeight, // 监听div宽高 初始设为0
      // terminalWidth: 0
    }
  },
  methods: {
    Xterm: function() {
      this.$terminal.applyAddon(fit);
      // 注册终端
      var term = new this.$terminal({
        cursorBlink: true,
        rows: 10,
        lineHeight: 1.2
        // tabStopWidth: 10  
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
      term.writeln('')
      this.terminalFlow(this)
      // term.prompt()

      return term
    },
    terminalFlow: function(that) {
      // console.log(that.times);
      let hostname = window.location.hostname;
      // let hostname = "go-online.heartublade.com"
      that.ws = new WebSocket('ws://' + hostname + '/api/ws/tty');
      that.ws.onopen = function(evt) {
        console.log(that.projectName);
        that.ws.send(JSON.stringify({
          'jwt': that.$cookie.get('jwt'),
          'project': that.projectName,
          'msg': '\n',
          'language': -2,
          'height': that.term.rows,
          'width': that.term.cols + 1
        }));
        // console.log(that.times);
        console.log(that.term.cols);
        console.log(that.term.rows);
        // that.term.writeln('链接建立成功');
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
            // console.log("exit");
            that.ws.close();
          }
          that.times = 0; // 连接成功后重置连接次数
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
        that.times++;
        that.term.writeln('链接已断开');
        that.term.writeln('5秒后尝试第'+ that.times +'次重连');
        that.ws = null;
        // console.log(that.term.cols);
        if(that.times < 10){
          setTimeout(() => {
            that.terminalFlow(that);
          }, 5000); //隔十秒重连一次
        }  
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
      }));
      // console.log(this.term.cols);
    },
    // 发送终端宽高
    terminalSizeSend: function(cols, rows){
      this.ws.send(JSON.stringify({
        'msg': '',
        'height': rows,
        'width': cols
      }));
    },
    fixSize (){
      if(this.term) {
        this.term.fit();
        var cols = this.term.cols + 1;
        var rows = this.term.rows;
        this.terminalSizeSend(cols,rows);
        // console.log("size fixed");
        // console.log(this.term.cols);
      }
    }
  },
  /*
  watch: {
    terminalHeight: function(){
      term.fit();
      console.log("height changed");
    },
    terminalWidth: function(){
      term.fit();
      console.log("width changed");
    }
  },
  */
  created() {
    this.projectName = this.$route.params.projectname;
    eventBus.$on('fixSize', this.fixSize);
  },
  mounted() {
    var that = this;
    this.term = this.Xterm();
    // console.log(this.term);
    /*
    // 获取div的宽高
    this.terminalHeight = this.$refs.xterm.clientHeight;
    this.terminalWidth = this.$refs.xterm.clientWidth;
    //var parentStyle = window.getComputedStyle(that.term.element.parentStyle);
    console.log(that.terminalHeight);
    console.log(that.terminalWidth);
    //console.log(this.terminalHeight);
    //console.log(this.terminalWidth);
      setInterval(() => {
        //that.term.fit();
        // that.terminalHeight = that.$refs.xterm.clientHeight;
        // that.terminalWidth = that.$refs.xterm.clientWidth;
        var parentStyle = window.getComputedStyle(that.term.element.parentElement);
        var parentWidth = parseInt(parentStyle.getPropertyValue('width'));
        console.log(that.terminalHeight);
        console.log(that.terminalWidth);
      }, 2000);
    */
    
    this.term.on('data', function(key) {
    /*  
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
    */
          that.terminalSend(key);
          // console.log(this.term.cols);
          // console.log(key);
      //   } else if (that.ws.readyState == 0) {
      //     // TODO: Store message when the ws is connecting and send message when the connection has been send
      //   }
      // }
    });
    //console.log(this.term.cols);
    //console.log(this.term.rows);
    
    //防止粘贴出现重复
    //this.term.on('paste', function(data, ev) {
      // that.command += data
      //that.terminalSend(data) 
    //})
  
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
  beforeDestroy () {
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
.xterm-viewport{
  overflow: hidden !important;
}
/*
.xterm-screen{
  width: 100% !important;
}

.xterm-link-layer, .xterm-selection-layer{
  width: 100% !important;
}
*/
</style>
