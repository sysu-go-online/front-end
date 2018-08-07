<template>
  <div id="wrapper">
    <mu-container id="login">
      <mu-row class="login-message">
        <mu-alert color="error" v-if="alert1">
          邮箱或密码错误
        </mu-alert>
      </mu-row>
      <mu-row class="login-form">
        <mu-col span="6">
          <mu-container>
            <mu-form :model="loginForm" class="input-box" label-width="100">
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
import crypto from 'crypto-js';
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        password: '',
        username: ''
      },
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
    }
  },
  created() {

  },
  methods: {
     login: function () {
      let that = this;
      var encrypted = crypto.SHA256(that.loginForm.password, 'go-online');
      this.$http.post('/api/sessions', {
        'password': encodeURIComponent(encrypted),
        'username': this.loginForm.username
      }).then(response => {
          if (response.status === 200) {
            console.log(response);
            that.$session.start()
            that.$session.set('jwt', response.headers.authorization);
            that.$session.set('username', that.loginForm.username);
            that.$http.defaults.headers.common['Authorization'] = response.headers.authorization;
            that.$router.push('/profile/my');
          }
        }).catch(err => {
          console.log(err.response);
          if (err.response.status === 400) {
            that.alert1 = true;
          }
        });
    },
    register: function () {
      this.$router.push('/register');
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
#login {
  box-shadow: 6px 4px 23px grey;
  background: white;
}
.login-form {
  .btn {
    margin: 10px 20px;
  }
  .input-box {
    padding: 20px 10px;
  }
}
.login-picture {
  background-color: #9254fa;
  .login-picture-text {
    font-size: 50px;
    color: white;
    line-height: 360px;
  }
}
</style>