<template>
  <div id="myProj">
    <heads></heads>
    <div id="content">
      <project-list v-if='isMyProjectList'></project-list>
      <garbage-list v-if='!isMyProjectList'></garbage-list>
      <div id="choose-div">
        <div id="myProject-div" v-on:click="showMyProject">我的项目</div>
        <div id="garbage-div" v-on:click="showGarbage">回收站</div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from 'components/header'
import Projectlist from 'components/projectlist'
import Garbagelist from 'components/garbagelist'

export default {
  name: 'myProject',
  components: {
    heads: Header,
    'project-list': Projectlist,
    'garbage-list': Garbagelist
  },
  data() {
    return {
      isMyProjectList: true
    }
  },
  methods: {
    showMyProject() {
      this.isMyProjectList = true;
    },

    showGarbage() {
      this.isMyProjectList = false;
    }
  }
}
</script>

<style>
#home{
  height: 100%;
  width: 100%;
}
#content {
    position: relative;
    width: 100%;
    height: calc(100% - 35px);
}
#choose-div {
    position: absolute;
    left: calc(100% - 200px);
    height: 100%;
    width: 200px;
    box-sizing: border-box;
    display: inline-block;
}
#myProject-div {
    width: 60%;
    height: 50px;
    line-height: 50px;
    margin: 10px;
    border: 1px solid gray;
    text-align: center;
}
#garbage-div {
    width: 60%;
    height: 50px;
    line-height: 50px;
    margin: 10px;
    border: 1px solid gray;
    text-align: center;
}
</style>
