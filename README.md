# online-editor

> A Vue.js online-deitor project

## 特点

1. 单页+多页应用结合
2. 多个页面之间的组件可以共享
2. 部分页面加载需要服务支持

## Dev模式运行

``` bash
# serve with hot reload at localhost:8010
npm run dev
```

## Build构建

支持本地预览，默认创建简单`node.js`服务器
``` bash
npm run build // Firstly
node server.js  // Secondly
```

## 文件架构
脚手架生成目录做修改后成品，示例如下：
```bash
├── src  # 主目录
│   ├── assets  # 资源文件目录 eg:`/assets/img/logo.png`
│   │   ├── img
│   │   │   └── logo.png
│   │   ├── js
│   │   └── css
│   ├── components # 组件目录 eg:`components/modal.vue`
│   │   └── modal.vue
│   └── pages  # 静态页面，包括：html文件，Vue页面组件文件，app.js入口文件
│       ├── user # 可自定义名称
│       │   ├── signin # 登录
│       │   │   ├── app.js   # 入口文件，与webpack配置有关
│       │   │   ├── app.html  # 可自定义名称
│       │   │   └── app.vue # html模板文件，与webpack配置有关
│       │   ├── signup # 注册
│       │   │   ├── app.js
│       │   │   ├── app.html
│       │   │   └── app.vue
│       │   │── home # 个人主页
│       │   │   │── project
│       │   │   │   │── app.js
│       │   │   │   │── app.html
│       │   │   │   │── app.vue
│       │   │   └──_ recyclebin
│       │   │       │── app.js
│       │   │       │── app.html
│       │   │       │── app.vue
│       │   └── information
│       │       │──app.js
│       │       │──app.html
│       │       └──app.vue
│       │
│       │── online-code # 主要功能页
│       │  ├── app.html
│       │  ├── app.js
│       │  └── app.vue   
│       │── home # 主页
│       │  ├── app.html
│       │  ├── app.js
│       │  └── app.vue
│       │── function # 网站功能演示
│       │  ├── app.html
│       │  ├── app.js
│       │  └── app.vue
│       │── guide # 网站教程
│       │  ├── app.html
│       │  ├── app.js
│       │  └── app.vue
│       └── about # 网站介绍
│          ├── app.html
│          ├── app.js
│          └── app.vue
│             
├── LICENSE
├── .babelrc
├── .eslintrc.js
├── server.js
├── package.json
├── postcss.config.js
└── README.md
```

<font color="red"> **注意:** 配置文件入口已经修改 </font>

## Dist 文件目录架构

脚手架自动生成示例如下，未做修改，build之后构建的静态文件架构目录如下：
```bash
├── assets
│   ├── css
│   │   ├── customer
│   │   │   ├── home.css
│   │   │   └── home.css.map
│   │   ├── user
│   │   │   ├── index.css
│   │   │   ├── index.css.map
│   │   │   ├── login.css
│   │   │   └── login.css.map
│   │   ├── vendors.css
│   │   └── vendors.css.map
│   └── js
│       ├── customer
│       │   └── home.js
│       ├── user
│       │   ├── index.js
│       │   └── login.js
│       └── vendors.js
├── b02bdc1b846fd65473922f5f62832108.ttf
├── customer
│   └── home.html
├── logo.png
└── user
    ├── index.html
    └── login.html
```

## webpack配置文件相关

目录：`build/`
```
webpack.base.conf.js # 生成需要的入口文件
webpack.dev.conf.js # 开发环境配置
webpack.prod.conf.js # 生产环境配置
```

入门：[webpack4.5中文文档](https://doc.webpack-china.org/concepts/)

详细解读：[https://github.com/DDFE/DDFE-blog/issues/10](https://github.com/DDFE/DDFE-blog/issues/10)

javascript glob:[模块使用记录学习——node-glob](https://blog.csdn.net/tangxiaolang101/article/details/53931145)

快速修改参考：[vue webpack多页配置](https://segmentfault.com/a/1190000011161704)


## 可使用插件
官方自带：[组件 | Element](https://element.eleme.io/#/zh-CN/component/breadcrumb)

其他：[iView介绍](https://www.iviewui.com/docs/guide/introduce)

## 目前使用
我是用的为iView,按需引入会导致`render`渲染iView相关组件时失效，考虑全局导入
