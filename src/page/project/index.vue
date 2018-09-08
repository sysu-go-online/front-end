<template>
  <div id="wrapper">
    <mu-container id="project">
      <router-view></router-view>
    </mu-container>
  </div>
</template>

<script>
export default {
  name: 'project-index',
  data () {
	return {

	  }
  },
  created() {

  },
  methods: {
	  
  }
}
</script>

<style lang="scss">
#wrapper {
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  align-items: center;
  background: #e8e7e9;
}
#project {
  height: 600px;
  background: white;
}
</style>