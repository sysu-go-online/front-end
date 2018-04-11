<template>
  <div id='maxbox'>
    <div id='project-list' v-for='item in items' v-bind:key='item.text'>
      <div id='single-project' v-on:click='showDetail'>
        <img id='project-icon' src='/assets/img/logo.png' >
        <div id='project-name'>{{item.name}}</div>
        <div id='add-or-delete'>
          <div id='add-project' v-if='!item.canDelete'>
            <img src='/assets/img/add.png'>
          </div>
          <div id='delete-project' v-if='item.canDelete'>
            <img src='/assets/img/delete.png'>
          </div>
        </div>
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
        {
          image: '',
          name: '项目一',
          canDelete: true
        },
        {
          image: '',
          name: '新建项目',
          canDelete: false
        }
      ]
    }
  },
  methods: {
    showDetail() {
      //跳转到online-code
    }
  }
}
</script>

<style>
#maxbox{
    display: inline-block;
    position: relative;
    left: 0;
    height: 100%;
    width: calc(100% - 200px);
}

#project-list {
  display: inline-block;
  height: 50px;
  width: calc(50% - 20px);
}

#single-project {
  display: flex;
  position: relative;
  margin: 10px;
  border: 1px solid gray;
  height: 50px;
}

#project-icon {
    display: table-column;
    height: 36px;
    width: 36px;
    margin: 6px;
}

#project-name {
    display: table-column;
    height: 50px;
    line-height: 50px;
}

#add-or-delete {
    display: table-column;
    position: absolute;
    right: 10px;
    bottom: 2px;
}

#add-or-delete img {
    height: 12px;
    width: 12px;
}

</style>
