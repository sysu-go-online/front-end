<template>
  <mu-container id="project-add">
    <mu-row id="project-form">
      <mu-col span="12">
        <mu-container>
          <mu-form ref="form" :model="form" label-width="100">
            <mu-form-item prop="name" label="Name" :rules="nameRules">
              <mu-text-field v-model="form.name" prop="name"></mu-text-field>
            </mu-form-item>
            <mu-form-item prop="description" label="Description" :rules="descriptionRules">
              <mu-text-field v-model="form.description" prop="description"></mu-text-field>
            </mu-form-item>
            <mu-flex align-items="center" style="padding-bottom: 8px;">
              <span style="margin-right: 16px;">运行环境</span>
              <mu-radio v-model="form.language" class="radio" value="0" label="Go"></mu-radio>
              <mu-radio v-model="form.language" class="radio" value="1" label="C"></mu-radio>
            </mu-flex>
            <mu-form-item prop="git_path" label="Git Path" :rules="gitpathRules">
              <mu-text-field v-model="form.git_path" prop="git_path"></mu-text-field>
            </mu-form-item>
            <mu-flex justify-content="center" align-items="center">
              <mu-button round color="#9254fa" @click="addProject" class="btn">添加项目</mu-button>
              <mu-button round color="#9254fa" @click="cancelProject" class="btn">取消</mu-button>
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
      // c_versions: [
      //   'c98',
      //   'c11'
      // ],
      // go_versions: [
      //   '1.9.0'
      // ],
      // versions: [],
      nameRules: [
        { validate: (val) => !!val, message: '必须填写项目名' },
        { validate: (val) => val.length <= 20, message: '项目名长度小于20' }
      ],
      descriptionRules: [
        { validate: (val) => val.length <= 50, message: '描述长度小于50' }
      ],
      gitpathRules: [
        { validate: (val) => !!val, message: '必须填写git地址' },
        { validate: (val) => val.length <= 40, message: '地址长度小于40' }
      ],
      form: {
        name: '',
        language: '',
        description: '',
        git_path: ''
        // version: '',
      }
    };
  },
  async created () {

  },
  methods: {
    addProject: function () {
      let that = this;
      this.$refs.form.validate().then((result) => {
        if (!result) return;
        this.$http.post('/api/users/' + this.$cookie.get('username') + '/projects', {
          'name': this.form.name,
          'description': this.form.description,
          'language': parseInt(this.form.language),
          'git_path': this.form.git_path
        }, {
          headers: {'Authorization': this.$cookie.get('jwt')}
        }).then(function (response) {
          if (response.status === 200) {
            that.$dialog.alert('项目创建成功，返回项目界面').then(function (dialog) {
              that.$router.go(-1);
            });
          }
        });
      });
    },
    cancelProject: function () {
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="scss">
#project-form {
  width: 400px;
  margin: 100px auto;

  .btn {
    margin: 10px 20px;
  }
  .input-box {
    padding: 20px 10px;
  }
  .radio {
    margin-right: 16px;
  }
}
.project-message {
  a {
    color: white;
  }
}

</style>
