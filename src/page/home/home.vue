<template>

</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      
    }
  },
  beforeCreate() {
      if (this.$session.get('username') == null) {
          this.$router.push('/login')
      }
  },
  created() {
      
  },
  methods: {

  }
}
</script>

<style>

</style>
