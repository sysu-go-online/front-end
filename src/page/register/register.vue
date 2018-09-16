<template>
  <div id="wrapper">
    <mu-container id="register">
      <mu-row class="register-form">
        <mu-col span="6">
          <mu-container>
            <mu-form ref="form" :model="registerForm" class="input-box" label-width="100">
              <mu-form-item prop="email" label="Email" :rules="emailRules">
                <mu-text-field v-model="registerForm.email" prop="email" type="email"></mu-text-field>
              </mu-form-item>
              <mu-form-item prop="username" label="Username" :rules="usernameRules">
                <mu-text-field v-model="registerForm.username" prop="username"></mu-text-field>
              </mu-form-item>
              <mu-form-item prop="password" label="Password" :rules="passwordRules">
                <mu-text-field v-model="registerForm.password" prop="password" type="password" @keyup.native.enter="register"></mu-text-field>
              </mu-form-item>
              <mu-flex justify-content="center" align-items="center">
                <mu-button round color="#9254fa" @click="login" class="btn">Login</mu-button>
                <mu-button round color="#9254fa" @click="register" class="btn">Register</mu-button>
              </mu-flex>
            </mu-form>
          </mu-container>
        </mu-col>
        <mu-col span="6" class="register-picture">
            <mu-flex justify-content="center" class="register-picture-text">Go Online</mu-flex>
        </mu-col>
      </mu-row>
    </mu-container>
  </div>
</template>

<script>
import crypto from 'crypto-js';
export default {
  name: 'register',
  data () {
    return {
      registerForm: {
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
      message: ''
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
      this.$refs.form.validate().then((result) => {
        if (!result) return;
        var encrypted = crypto.SHA256(that.registerForm.password, 'go-online');
        that.$http.post('/api/users', {
          'email': that.registerForm.email,
          'password': encodeURIComponent(encrypted),
          'username': that.registerForm.username
        }).then(function (response) {
          if (response.status === 200) {
            that.$dialog.alert('注册成功，前往登录').then(function(dialog) {
              that.$router.replace('/login');
            });
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
#register {
  box-shadow: 6px 4px 23px grey;
  background: white;
  padding: 0;
}
.register-form {
  .btn {
    margin: 10px 20px;
  }
  .input-box {
    padding: 20px 10px;
  }
}
.register-picture {
  background-color: #9254fa;
  .register-picture-text {
    font-size: 50px;
    color: white;
    line-height: 360px;
  }
}
</style>