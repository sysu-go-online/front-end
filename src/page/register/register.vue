<template>
  <div id="wrapper">
    <mu-container id="login">
      <mu-row class="login-message">
        <mu-alert color="success" v-if="success">
          注册成功，请前往登录
        </mu-alert>
      </mu-row>
      <mu-row class="login-form">
        <mu-col span="6">
          <mu-container>
            <mu-form ref="form" :model="loginForm" class="mu-demo-form" label-width="100">
              <mu-form-item prop="email" label="Email" :rules="emailRules">
                <mu-text-field v-model="loginForm.email" prop="email" type="email"></mu-text-field>
              </mu-form-item>
              <mu-form-item prop="username" label="Username" :rules="usernameRules">
                <mu-text-field v-model="loginForm.username" prop="username"></mu-text-field>
              </mu-form-item>
              <mu-form-item prop="password" label="Password" :rules="passwordRules">
                <mu-text-field v-model="loginForm.password" prop="password" type="password"></mu-text-field>
              </mu-form-item>
              <mu-flex justify-content="center" align-items="center">
                <mu-button round color="#9254fa" @click="login" class="btn">Login</mu-button>
                <mu-button round color="#9254fa" @click="register" class="btn">Register</mu-button>
              </mu-flex>
            </mu-form>
          </mu-container>
        </mu-col>
        <mu-col span="6" class="login-picture">
            <mu-flex justify-content="center" class="login-picture-text">Go Online</mu-flex>
        </mu-col>
      </mu-row>
    </mu-container>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        email: '',
        password: '',
        username: ''
      },
      emailRules: [
        { validate: (val) => !!val, message: '必须填写邮箱'},
        { validate: (val) => val.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/), message: '邮箱必须符合格式'}
      ],
      usernameRules: [
        { validate: (val) => !!val, message: '必须填写用户名'},
        { validate: (val) => val.length >= 3 && val.length <= 20, message: '用户名长度小于20'}
      ],
      passwordRules: [
        { validate: (val) => !!val, message: '必须填写密码'},
        { validate: (val) => val.length >= 3 && val.length <= 20, message: '密码长度大于3小于20'}
      ],
      message: '',
      alert1: false,
      success: false
    }
  },
  created() {

  },
  methods: {
    login: function () {
      this.$router.push('/login');
    },
    register: function () {
      let that = this;
      console.log(that.$refs);
      this.$refs.form.validate().then((result) => {
        if (!result) return;
        that.$http.post('/api/users', {
          'email': that.loginForm.email,
          'password': that.loginForm.password,
          'username': that.loginForm.username
        }).then(function (response) {
          if (response.status === 200) {
            that.success = true;
          }
        });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#wrapper {
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  align-items: center;
}
.login-form {
  
  height: 250px;
  .btn {
    margin: 10px 20px;
  }
}
.login-picture {
  background-color: #9254fa;
  height: 250px;
  .login-picture-text {
    font-size: 50px;
    color: white;
    line-height: 250px;
  }
}
</style>