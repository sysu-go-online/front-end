<template>
  <div id='project'>
    <div id='project-list'>
      <div class='single-project' v-for='item in items' v-bind:key='item.name'>
        <div class='project-name project-info-row'>{{item.name}}</div>
        <div class='project-language project-info-row'>{{item.language}}</div>
        <div class='project-actions project-info-row'>
          <div class='delete' @click='deleteProject(item.name)'>删除</div>
          <div class='open'><router-link :to="'/editor/'+item.name">打开</router-link></div>
        </div>
      </div>
      <div id='add-project' class='single-project' @click='addProject'>
        <font-awesome-icon icon="plus" size='4x' style="color: black; line-height: 150px;" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectList',
  data () {
    return {
      items: [
      ]
    };
  },
  async created () {
    let res = await this.$http.get('/api/users/' + this.$cookie.get('username') + '/projects');
    if (res.data) {
      this.items = res.data;
    }
  },
  methods: {
    addProject () {
      this.$router.push('/project/add');
    },
    deleteProject (name) {
      this.$dialog.confirm('确定要删除项目' + name + '吗？')
        .then(function () {
          this.$http.delete('/api/users/' + this.$cookie.get('username') + '/projects/' + name, {
            headers: {'Authorization': this.$cookie.get('jwt')}
          }).then(function () {
            this.$dialog.alert('删除项目' + name + '成功');
          });
        });
    }
  }
};
</script>

<style lang="scss">
#project {
  overflow: auto;
  width: 100%;
  height: 100%;
}

#project-list {
  display: flex;
  flex-wrap: wrap;
}

.single-project {
  position: relative;
  margin: 10px;
  border: 1px solid gray;
  height: 150px;
  width: 30%;

  .project-info-row {
    width: 100%;
    height: 20px;
  }
  .project-name {
    height: 30px;
    line-height: 30px;
    text-align: center;
  }
  .project-language {
    height: 90px;
    padding: 10px;
  }
  .project-actions {
    height: 30px;
    display: flex;
    justify-content: flex-end;
    >div {
      margin: 5px 5px;
    }
    .delete {
      cursor: pointer;
    }
  }
}

#add-project {
  border-style: dashed;
  padding: 45px 100px;
  cursor: pointer;
}

</style>
