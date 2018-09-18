<template>
  <div>Egoist天下第一</div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {

    };
  },
  beforeCreate () {
    if (this.$cookie.get('jwt') == null) {
      this.$router.push('/login');
    } else {
      this.$router.push('/profile/my');
    }
  },
  created () {

  },
  methods: {

  }
};
</script>

<style>

</style>
