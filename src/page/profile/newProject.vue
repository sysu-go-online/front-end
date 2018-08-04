<template>
	<mu-container id="login">
	  <mu-row class="login-message">
      <mu-alert color="success" v-if="success">
        项目创建成功，请返回项目列表
      </mu-alert>
	  </mu-row>
	  <mu-row class="login-form">
      <mu-col span="12">
        <mu-container>
          <mu-form ref="form" :model="form" label-width="100">
            <mu-form-item prop="name" label="Name" :rules="nameRules">
            <mu-text-field v-model="form.name" prop="name"></mu-text-field>
            </mu-form-item>
            <mu-form-item prop="language" label="Language">
              <mu-select v-model="form.language" @change="changeVersion">
                <mu-option v-for="option in languages" :key="option" :label="option" :value="option"></mu-option>
              </mu-select>
            </mu-form-item>
            <mu-form-item prop="version" label="Version">
              <mu-select v-model="form.version">
                <mu-option v-for="option in versions" :key="option" :label="option" :value="option"></mu-option>
              </mu-select>
            </mu-form-item>
            <mu-flex justify-content="center" align-items="center">
              <mu-button round color="#9254fa" @click="addProject" class="btn">添加项目</mu-button>
            </mu-flex>
          </mu-form>
        </mu-container>
      </mu-col>
	  </mu-row>
	</mu-container>
</template>

<script>
export default {
  name: 'AddProject',
  data () {
    return {
      languages: [
        'go',
        'c'
      ],
      c_versions: [
        'c98',
        'c11'
      ],
      go_versions: [
        '1.9.0'
      ],
      versions: [],
      nameRules: [
        { validate: (val) => !!val, message: '必须填写项目名'},
        { validate: (val) => val.length <= 20, message: '项目名长度小于20'}
      ],
      form: {
        name: '',
        language: '',
        version: '',
      },
      success: false,
    }
  },
  async created() {

  },
  methods: {
    changeVersion: function (val) {
      switch (val) {
        case 'c':
          this.versions = this.c_versions;
          break;
        case 'go':
          this.versions = this.go_versions;
        default:
          break;
      }
    },
    addProject: function () {
      let that = this;
      this.$refs.form.validate().then((result) => {
        if (!result) return;
        that.$http.post('/api/users/' + that.$session.get('username') + '/projects', {
          'name': that.form.name,
          'language': that.form.language,
          'settings': {
            'versions': that.form.version
          }
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

<style>

</style>
