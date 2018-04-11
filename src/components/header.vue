<template>
    <div id="header">
        <h1>在线编辑器</h1>
        <p id="signin">登陆</p>
        <p id="register">注册</p>
    </div>
</template>

<script>
export default {
    name: 'Header'
}
</script>

<style>
#header{
    position: relative;
    height: 35px;
    width: 100%;
    box-sizing: border-box;
}
h1{
    position: absolute;
    margin: 0;
    padding: 5px 10px 3px 10px;
    font-size: 20px;
    color: #009A61;
    box-sizing: border-box;
    display: inline-block;
}
#signin, #register{
    margin: 5px 0 3px 0;
    position: absolute;
    width: 40px;
    font-size: 18px;
    color: #009A61;

    display: inline-block;
}
#signin{
    right: 60px;
}
#register{
    right: 10px;
}
</style>
