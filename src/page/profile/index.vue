<template>
  <div id="wrapper">
	<mu-container id="profile">
	  <mu-row>
		<mu-col span="3" class="tab-list">
		  <mu-container>
        <mu-list>
          <mu-list-item button :ripple="false" to="/profile/my" active-class="active-link">
            <mu-list-item-title>个人资料</mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" to="/profile/project" active-class="active-link">
            <mu-list-item-title>项目信息</mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" to="/profile/add" active-class="active-link">
            <mu-list-item-title>添加项目</mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" @click="logout">
            <mu-list-item-title>登出</mu-list-item-title>
          </mu-list-item>
        </mu-list>
		  </mu-container>
		</mu-col>
		<mu-col span="9" class="profile-list">
			<router-view></router-view>
		</mu-col>
	  </mu-row>
	</mu-container>
  </div>
</template>

<script>
export default {
  name: 'profile-index',
  data () {
	return {

	  }
  },
  created() {

  },
  methods: {
	  logout: function (params) {
      let that = this;
      this.$http.delete('/api/sessions')
        .then(function () {
          that.$session.destroy();
          delete that.$http.defaults.headers.common.Authorization;
          that.$router.replace('/login');
        }).catch(function () {
          that.$router.replace('/login');
        })
    }
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
#profile {
  height: 300px;
  background: white;
}
.row {
  height: 100%;
}
.tab-list {
  height: 100%;
  border-right: 1px solid #e8e7e9;
}
.active-link {
  background: #e8e7e9;
}
</style>