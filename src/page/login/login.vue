<template>
  <div id="wrapper">
    <mu-container id="login">
      <mu-row class="login-form">
        <mu-col span="6">
          <mu-container>
            <mu-form :model="loginForm" class="input-box" label-width="100">
              <mu-form-item prop="username" label="Username" :rules="usernameRules">
                <mu-text-field v-model="loginForm.username" prop="username"></mu-text-field>
              </mu-form-item>
              <mu-form-item prop="password" label="Password" :rules="passwordRules">
                <mu-text-field v-model="loginForm.password" prop="password" type="password" @keyup.native.enter="login"></mu-text-field>
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
        { validate: (val) => !!val, message: '必须填写用户名' },
        { validate: (val) => val.length >= 3 && val.length <= 20, message: '用户名长度小于20' }
      ],
      passwordRules: [
        { validate: (val) => !!val, message: '必须填写密码' },
        { validate: (val) => val.length >= 3 && val.length <= 20, message: '密码长度大于3小于20' }
      ]
    };
  },
  created () {
    console.log(this);
  },
  methods: {
    login: function () {
      var encrypted = crypto.SHA256(this.loginForm.password, 'go-online');
      this.$http.post('/api/auth?type=jwt', {
        'password': encodeURIComponent(encrypted),
        'username': this.loginForm.username
      }).then(response => {
        if (response.status === 200) {
          this.$cookie.delete('jwt');
          this.$cookie.delete('username');
          let token = this.$jwt.decode(response.headers.authorization, 'go-online');
          let exp = new Date();
          exp.setDate(token.jwt);
          this.$cookie.set('jwt', response.headers.authorization, { expires: exp });
          this.$cookie.set('username', token.sub, { expires: exp });
          this.$router.push('/profile/my');
        }
      }).catch(err => {
        console.log(err);
        if (err.response.status === 400) {
          this.$dialog.alert('用户名或密码错误');
        }
      });
    },
    register: function () {
      this.$router.push('/register');
    }
  }
};
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
  padding-left: 0;
  padding-right: 0;
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
