<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    if (this.$cookie.get('jwt')) {
      this.$http.post('/api/auth?type=jwt', {}, {
        headers: {'Authorization': this.$cookie.get('jwt')}
      });
    } else {
      this.$router.push('/login');
    }
  }
};
</script>

<style>
html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
}
#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #C2C2C3;
  height: 100%;
  width: 100%;
}
.f-right {
  float: right;
}
.dg-content-body {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}
</style>
