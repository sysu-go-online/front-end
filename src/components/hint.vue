<template>
  <div id="command_hint">
      <p class="func_button">常用命令</p>
      <li>ls</li>
      <li>cd</li>
      <li>rm</li>
  </div>
</template>

<script>
export default {
  name: 'Hint'
}
</script>

<style>
#command_hint{
    width: 100%;
    height: calc(100% - 432px);
    background:rgba(27, 27, 27, 0.96);
    overflow-y: auto;
    overflow-x: hidden;
}
li{
    color: #009A61;
    margin-left: 10px;
    font-size: 14px;
}
</style>
