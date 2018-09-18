<template>
  <div id="home">
    <heads></heads>
    <div id="main">
      <div id="menu">
        <div class="menu-icon"><svg class="icon icon-file" @click="showProjectView"><use xlink:href="#icon-file"></use></svg></div>
        <div class="menu-icon"><svg class="icon icon-terminal" @click="showShell"><use xlink:href="#icon-terminal"></use></svg></div>
      </div>
      <div id="main_function" @mousemove="moveHandler" @mousedown="downHandler" @mouseup="upHandler">
        <div id="file_tree">
          <project-view @openfile="openFile" v-bind:style="{width: projectViewWidth}" ref="projectView"></project-view>
        </div>
        <div id="command_line" v-bind:style="{left: commandLineLeft, width: commandLineWidth}">
          <editor :fileData="this.fileData" :projectName="this.projectName" v-bind:style="{height: editorHeight}"></editor>
          <shell v-bind:style="{height: shellHeight}" :height="shellHeight" :width="commandLineWidth"></shell>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Editor from '../../components/editor';
import Header from '../../components/header';
import Shell from '../../components/shell';
import Hint from '../../components/hint';
import Projectview from '../../components/projectview';

export default {
  name: 'Editor',
  components: {
    editor: Editor,
    heads: Header,
    shell: Shell,
    hint: Hint,
    'project-view': Projectview
  },
  data () {
    return {
      projectViewWidth: '200px',
      commandLineLeft: '200px',
      editorHeight: 'calc(100% - 200px)',
      shellHeight: '200px',
      fileData: {},
      projectName: '',
      commandLineWidth: 'calc(100% - 200px)',
      leftResizeLineX: 0,
      leftResizeLineY: 0,
      leftResizeLineYWidth: 0,
      rightResizeLineX: 0,
      rightResizeLineY: 0,
      rightResizeLineXWidth: 0,
      onLeftLine: false,
      onRightLine: false,
      mouseState: 'up'
    };
  },
  beforeCreate: function () {

  },
  created: function () {

  },
  mounted: function () {
    var coordinate = this.getCoordinate('file_tree');
    this.leftResizeLineX = coordinate[0];
    this.leftResizeLineY = coordinate[1];
    this.leftResizeLineYWidth = coordinate[3];

    coordinate = this.getCoordinate('editor');
    this.rightResizeLineX = coordinate[0];
    this.rightResizeLineY = coordinate[1];
    this.rightResizeLineXWidth = coordinate[2];

    this.contextMenuTarget = document.getElementById('file_tree');
    console.log(this.contextMenuTarget);
  },
  updated: function () {
    var coordinate = this.getCoordinate('file_tree');
    this.leftResizeLineX = coordinate[0];
    this.leftResizeLineY = coordinate[1];
    this.leftResizeLineYWidth = coordinate[3];

    coordinate = this.getCoordinate('editor');
    this.rightResizeLineX = coordinate[0];
    this.rightResizeLineY = coordinate[1];
    this.rightResizeLineXWidth = coordinate[2];

    console.log(this.leftResizeLineX);
    console.log(this.rightResizeLineY);
  },
  methods: {
    showProjectView: function () {
      // var coordinate = this.getCoordinate('file_tree')
      if (this.projectViewWidth !== '0') {
        this.projectViewWidth = '0';
        this.commandLineLeft = '0';
        this.commandLineWidth = '100%';
      } else {
        this.projectViewWidth = '200px';
        this.commandLineLeft = '200px';
        this.commandLineWidth = 'calc(100% - 200px)';
      }
    },
    showShell: function () {
      if (this.shellHeight !== '0') {
        this.editorHeight = '100%';
        this.shellHeight = '0';
      } else {
        this.editorHeight = 'calc(100% - 200px)';
        this.shellHeight = '200px';
      }
    },
    openFile: function (data, projectName) {
      this.fileData = data;
      this.projectName = projectName;
    },
    /* ------------------------------ 可拖动工作区函数 ---------------------------- */
    getCoordinate: function (id) {
      var p = window.$('#' + id).offset();
      var w = window.$('#' + id).width();
      var h = window.$('#' + id).height();
      return [p.left + w, p.top + h, w, h];
    },
    moveHandler: function (e) {
      var X = e.clientX;
      var Y = e.clientY;

      // 在projectview和editor\terminal之间
      if (X >= this.leftResizeLineX - 5 && X <= this.leftResizeLineX + 5 &&
        Y >= this.leftResizeLineY - this.leftResizeLineYWidth && Y <= this.leftResizeLineY &&
        this.mouseState !== 'down') {
        window.$('#main_function').addClass('col-resize');
        this.onLeftLine = true;
        return;
      // 在editor和shell之间
      } else if (X >= this.rightResizeLineX - this.rightResizeLineXWidth && X <= this.rightResizeLineX &&
        Y >= this.rightResizeLineY - 10 && Y < this.rightResizeLineY + 10 &&
        this.mouseState !== 'down') {
        window.$('#main_function').addClass('row-resize');
        this.onRightLine = true;
      } else {
        // 其他情况，判断是否需要修改onRightLine，onLeftLine
        if (this.mouseState === 'up') {
          this.onLeftLine = false;
          this.onRightLine = false;
          window.$('#main_function').removeClass('col-resize');
          window.$('#main_function').removeClass('row-resize');
          return;
        }
      }

      // 以上位置或者在其他位置，但是onmousedown
      var reg = /\d+/g;
      // 拖动改变project-view和command_line
      if (this.mouseState === 'down' && this.onLeftLine) {
        var sub = X - this.leftResizeLineX;
        this.leftResizeLineX = X;
        this.projectViewWidth = (parseInt(this.projectViewWidth.match(reg)[0]) + sub) + 'px';
        this.commandLineWidth = 'calc(100% - ' + this.projectViewWidth + ')';
        console.log(this.commandLineWidth);
        // 设置command_line left值
        this.commandLineLeft = this.projectViewWidth;

        if (parseInt(this.projectViewWidth.match(reg)[0]) < 100) {
          this.projectViewWidth = '0';
          this.commandLineLeft = '0';
          this.commandLineWidth = '100%';
        }
      // 拖动改变editor和shell
      } else if (this.mouseState === 'down' && this.onRightLine) {
        // 修改div大小
        sub = Y - this.rightResizeLineY;
        this.rightResizeLineY = Y;
        this.shellHeight = (parseInt(this.shellHeight.match(reg)[0]) - sub) + 'px';
        this.editorHeight = 'calc(100% - ' + this.shellHeight + ')';

        if (parseInt(this.shellHeight.match(reg)[0]) < 100) {
          this.editorHeight = '100%';
          this.shellHeight = '0';
        }
      }
    },
    downHandler: function (e) {
      if (this.onLeftLine || this.onRightLine) {
        this.mouseState = 'down';
      }
    },
    upHandler: function (e) {
      this.mouseState = 'up';
      this.onLeftLine = false;
      this.onRightLine = false;
    }
  }
};

</script>

<style>
#menu {
    position: absolute;
    left: 0;
    height: 100%;
    width: 50px;
    background: #000;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    display: inline-block;
}
.menu-icon {
  color:#009A61;
  padding: 10px;
}
.icon-file, .icon-terminal {
  width: 32px !important;
  height: 32px !important;
}
#home{
  height: 100%;
  width: 100%;
}
#main {
    position: relative;
    width: 100%;
    height: calc(100% - 35px);
    background-color: black;
}
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}
/* --------------------------可拖动工作区设置------------------------------------*/
#main_function {
  position: absolute;
  background-color: #292929;
  width: calc(100% - 50px);
  height: 100%;
  overflow: hidden;
  left: 50px;
}
#file_tree {
  position: absolute;
  margin: 0;
  height: 100%;
  background-color:  #292929;
}
#command_line{
  position: absolute;
  height: 100%;
  box-sizing: border-box;
  background: #000;
}
.col-resize {
  cursor: col-resize;
}
.row-resize {
  cursor: row-resize;
}

/*-------------右键弹窗样式---------------- */
a {
  color: #333;
}
</style>
