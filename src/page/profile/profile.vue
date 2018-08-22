<template>
	<mu-container id="profile-detail">
    <p>邮箱：{{email}}</p>
	</mu-container>
</template>

<script>
export default {
  name: 'profile',
  data () {
    return {
      email: 'undefined',
    }
  },
  async created() {
    let res = await this.$http.get('/api/users/' + this.$session.get('username'));
    this.email = res.data.email; 
  },
  methods: {
	 
  }
}
</script>

<style lang="scss" scoped>

</style>